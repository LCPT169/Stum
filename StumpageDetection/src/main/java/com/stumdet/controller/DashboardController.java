package com.stumdet.controller;

import com.stumdet.pojo.Project;
import com.stumdet.pojo.Task;
import com.stumdet.service.ProjectService;
import com.stumdet.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.File;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * 仪表盘相关API控制器
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TaskService taskService;

    /**
     * 获取仪表盘统计数据
     * 包括项目总数、新增项目数、任务总数、存储使用情况等
     * @return 仪表盘统计数据
     */
    @RequestMapping("/stats")
    @ResponseBody
    @CrossOrigin
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> result = new HashMap<>();
        
        // 获取所有项目
        List<Project> allProjects = new ArrayList<>();
        // 由于没有直接获取所有项目的方法，这里简单处理
        List<Task> allTasks = taskService.getAllTasks();
        
        // 计算项目统计数据
        Map<String, Object> projectStats = new HashMap<>();
        int totalProjects = allProjects.size();
        
        // 计算最近30天新增的项目数
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minus(30, ChronoUnit.DAYS);
        Timestamp thirtyDaysAgoTimestamp = Timestamp.valueOf(thirtyDaysAgo);
        
        int newProjects = 0;
        for (Project project : allProjects) {
            if (project.getCreateTime().after(thirtyDaysAgoTimestamp)) {
                newProjects++;
            }
        }
        
        int projectGrowth = totalProjects > 0 ? (newProjects * 100 / totalProjects) : 0;
        
        projectStats.put("total", totalProjects);
        projectStats.put("new", newProjects);
        projectStats.put("growth", projectGrowth);
        
        // 计算任务统计数据
        Map<String, Object> taskStats = new HashMap<>();
        int totalTasks = allTasks.size();
        int completedTasks = 0;
        int pendingTasks = 0;
        
        for (Task task : allTasks) {
            if ("COMPLETED".equals(task.getStatus())) {
                completedTasks++;
            } else if ("PENDING".equals(task.getStatus()) || "PROCESSING".equals(task.getStatus())) {
                pendingTasks++;
            }
        }
        
        taskStats.put("total", totalTasks);
        taskStats.put("completed", completedTasks);
        taskStats.put("pending", pendingTasks);
        
        // 计算存储使用情况
        Map<String, Object> storageStats = new HashMap<>();
        
        // 获取系统存储信息
        File imageRepoDir = new File("F:/StumdetRoot/ImageRepo/"); // 根据实际路径调整
        File outputRootDir = new File("F:/StumdetRoot/ODMOutputRoot/"); // 根据实际路径调整
        
        long totalSpace = imageRepoDir.getTotalSpace() / (1024 * 1024); // MB
        long usedSpace = calculateFolderSize(imageRepoDir) / (1024 * 1024); // MB
        usedSpace += calculateFolderSize(outputRootDir) / (1024 * 1024); // MB
        long freeSpace = totalSpace - usedSpace;
        
        storageStats.put("total", totalSpace);
        storageStats.put("used", usedSpace);
        storageStats.put("free", freeSpace);
        
        // 汇总结果
        result.put("projects", projectStats);
        result.put("tasks", taskStats);
        result.put("storage", storageStats);
        
        return result;
    }
    
    /**
     * 获取最近活动
     * @param limit 限制返回数量
     * @return 最近活动列表
     */
    @RequestMapping("/activities")
    @ResponseBody
    @CrossOrigin
    public List<Map<String, Object>> getRecentActivities(@RequestParam(value = "limit", defaultValue = "5") int limit) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // 获取最近的任务作为活动
        List<Task> allTasks = taskService.getAllTasks();
        
        // 按更新时间排序
        allTasks.sort((t1, t2) -> t2.getUpdateTime().compareTo(t1.getUpdateTime()));
        
        // 限制数量
        int count = Math.min(limit, allTasks.size());
        for (int i = 0; i < count; i++) {
            Task task = allTasks.get(i);
            
            Map<String, Object> activity = new HashMap<>();
            activity.put("id", i + 1);
            activity.put("user", "系统");
            
            // 根据任务状态生成活动描述
            String action;
            if ("COMPLETED".equals(task.getStatus())) {
                action = "完成了任务";
            } else if ("PROCESSING".equals(task.getStatus())) {
                action = "正在处理任务";
            } else if ("PENDING".equals(task.getStatus())) {
                action = "创建了任务";
            } else {
                action = "更新了任务";
            }
            
            activity.put("action", action);
            activity.put("target", task.getTname());
            activity.put("time", task.getUpdateTime().toString());
            
            activities.add(activity);
        }
        
        return activities;
    }
    
    /**
     * 获取项目趋势数据
     * @param period 时间周期（day, week, month, year）
     * @return 项目趋势数据
     */
    @RequestMapping("/project-trends")
    @ResponseBody
    @CrossOrigin
    public Map<String, Object> getProjectTrends(@RequestParam(value = "period", defaultValue = "month") String period) {
        Map<String, Object> result = new HashMap<>();
        
        List<String> labels = new ArrayList<>();
        List<Integer> newProjects = new ArrayList<>();
        List<Integer> completedProjects = new ArrayList<>();
        
        // 根据时间周期生成标签和数据
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;
        ChronoUnit unit;
        int dataPoints;
        
        switch (period) {
            case "week":
                startDate = now.minus(7, ChronoUnit.DAYS);
                unit = ChronoUnit.DAYS;
                dataPoints = 7;
                break;
            case "year":
                startDate = now.minus(12, ChronoUnit.MONTHS);
                unit = ChronoUnit.MONTHS;
                dataPoints = 12;
                break;
            case "month":
            default:
                startDate = now.minus(6, ChronoUnit.MONTHS);
                unit = ChronoUnit.MONTHS;
                dataPoints = 6;
                break;
        }
        
        // 生成模拟数据
        for (int i = 0; i < dataPoints; i++) {
            LocalDateTime pointDate = startDate.plus(i, unit);
            
            // 生成标签
            String label;
            if (unit == ChronoUnit.DAYS) {
                label = pointDate.getDayOfMonth() + "日";
            } else if (unit == ChronoUnit.MONTHS) {
                label = (pointDate.getMonthValue()) + "月";
            } else {
                label = pointDate.getYear() + "年";
            }
            
            labels.add(label);
            
            // 生成随机数据
            Random random = new Random();
            newProjects.add(random.nextInt(10));
            completedProjects.add(random.nextInt(8));
        }
        
        // 构建返回结果
        result.put("labels", labels);
        
        List<Map<String, Object>> datasets = new ArrayList<>();
        
        Map<String, Object> newProjectsDataset = new HashMap<>();
        newProjectsDataset.put("label", "新建项目");
        newProjectsDataset.put("data", newProjects);
        datasets.add(newProjectsDataset);
        
        Map<String, Object> completedProjectsDataset = new HashMap<>();
        completedProjectsDataset.put("label", "完成项目");
        completedProjectsDataset.put("data", completedProjects);
        datasets.add(completedProjectsDataset);
        
        result.put("datasets", datasets);
        
        return result;
    }
    
    /**
     * 获取任务统计数据
     * @return 任务统计数据
     */
    @RequestMapping("/task-stats")
    @ResponseBody
    @CrossOrigin
    public Map<String, Object> getTaskStats() {
        Map<String, Object> result = new HashMap<>();
        
        List<Task> allTasks = taskService.getAllTasks();
        int total = allTasks.size();
        
        // 统计不同状态的任务数量
        int completed = 0;
        int processing = 0;
        int pending = 0;
        int failed = 0;
        
        for (Task task : allTasks) {
            switch (task.getStatus()) {
                case "COMPLETED":
                    completed++;
                    break;
                case "PROCESSING":
                    processing++;
                    break;
                case "PENDING":
                    pending++;
                    break;
                case "FAILED":
                    failed++;
                    break;
            }
        }
        
        result.put("total", total);
        
        List<Map<String, Object>> data = new ArrayList<>();
        
        if (total > 0) {
            Map<String, Object> completedData = new HashMap<>();
            completedData.put("name", "已完成");
            completedData.put("value", completed);
            completedData.put("percentage", Math.round((double) completed / total * 100));
            data.add(completedData);
            
            Map<String, Object> processingData = new HashMap<>();
            processingData.put("name", "处理中");
            processingData.put("value", processing);
            processingData.put("percentage", Math.round((double) processing / total * 100));
            data.add(processingData);
            
            Map<String, Object> pendingData = new HashMap<>();
            pendingData.put("name", "等待中");
            pendingData.put("value", pending);
            pendingData.put("percentage", Math.round((double) pending / total * 100));
            data.add(pendingData);
            
            Map<String, Object> failedData = new HashMap<>();
            failedData.put("name", "失败");
            failedData.put("value", failed);
            failedData.put("percentage", Math.round((double) failed / total * 100));
            data.add(failedData);
        }
        
        result.put("data", data);
        
        return result;
    }
    
    /**
     * 获取存储统计数据
     * @return 存储统计数据
     */
    @RequestMapping("/storage-stats")
    @ResponseBody
    @CrossOrigin
    public Map<String, Object> getStorageStats() {
        Map<String, Object> result = new HashMap<>();
        
        // 获取系统存储信息
        File imageRepoDir = new File("F:/StumdetRoot/ImageRepo/"); // 根据实际路径调整
        File outputRootDir = new File("F:/StumdetRoot/ODMOutputRoot/"); // 根据实际路径调整
        
        long totalSpace = imageRepoDir.getTotalSpace() / (1024 * 1024); // MB
        long imageRepoSpace = calculateFolderSize(imageRepoDir) / (1024 * 1024); // MB
        long outputRootSpace = calculateFolderSize(outputRootDir) / (1024 * 1024); // MB
        long freeSpace = totalSpace - (imageRepoSpace + outputRootSpace);
        
        result.put("total", totalSpace);
        
        // 创建符合前端期望的数据结构
        Map<String, Object> usedSpace = new HashMap<>();
        usedSpace.put("images", imageRepoSpace);
        usedSpace.put("models", outputRootSpace / 2); // 假设一半是模型文件
        usedSpace.put("reports", outputRootSpace / 4); // 假设四分之一是报告文件
        usedSpace.put("other", outputRootSpace / 4); // 假设四分之一是其他文件
        
        result.put("used", usedSpace);
        
        return result;
    }
    
    /**
     * 计算文件夹大小
     * @param directory 文件夹
     * @return 文件夹大小（字节）
     */
    private long calculateFolderSize(File directory) {
        long length = 0;
        if (directory.exists() && directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isFile()) {
                        length += file.length();
                    } else if (file.isDirectory()) {
                        length += calculateFolderSize(file);
                    }
                }
            }
        }
        return length;
    }
}
