USE [master]
GO
/****** Object:  Database [stumdetdb]    Script Date: 2024/12/31 15:06:34 ******/
CREATE DATABASE [stumdetdb]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'stumdetdb', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\stumdetdb.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'stumdetdb_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\stumdetdb_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [stumdetdb] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [stumdetdb].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [stumdetdb] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [stumdetdb] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [stumdetdb] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [stumdetdb] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [stumdetdb] SET ARITHABORT OFF 
GO
ALTER DATABASE [stumdetdb] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [stumdetdb] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [stumdetdb] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [stumdetdb] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [stumdetdb] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [stumdetdb] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [stumdetdb] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [stumdetdb] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [stumdetdb] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [stumdetdb] SET  ENABLE_BROKER 
GO
ALTER DATABASE [stumdetdb] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [stumdetdb] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [stumdetdb] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [stumdetdb] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [stumdetdb] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [stumdetdb] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [stumdetdb] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [stumdetdb] SET RECOVERY FULL 
GO
ALTER DATABASE [stumdetdb] SET  MULTI_USER 
GO
ALTER DATABASE [stumdetdb] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [stumdetdb] SET DB_CHAINING OFF 
GO
ALTER DATABASE [stumdetdb] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [stumdetdb] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [stumdetdb] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [stumdetdb] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'stumdetdb', N'ON'
GO
ALTER DATABASE [stumdetdb] SET QUERY_STORE = ON
GO
ALTER DATABASE [stumdetdb] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [stumdetdb]
GO
/****** Object:  Table [dbo].[image_repo]    Script Date: 2024/12/31 15:06:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[image_repo](
	[rid] [varchar](64) NOT NULL,
	[uid] [varchar](64) NOT NULL,
	[count] [int] NULL,
	[repo_location] [varchar](256) NOT NULL,
	[create_time] [datetime] NULL,
	[size] [int] NULL,
 CONSTRAINT [PK_image_repo] PRIMARY KEY CLUSTERED 
(
	[rid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[odm_project]    Script Date: 2024/12/31 15:06:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[odm_project](
	[pid] [varchar](64) NOT NULL,
	[uid] [varchar](64) NOT NULL,
	[pname] [varchar](128) NOT NULL,
	[description] [text] NULL,
	[create_time] [datetime] NULL,
 CONSTRAINT [PK_odm_project] PRIMARY KEY CLUSTERED 
(
	[pid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[odm_task]    Script Date: 2024/12/31 15:06:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[odm_task](
	[tid] [varchar](64) NOT NULL,
	[rid] [varchar](64) NULL,
	[pid] [varchar](64) NULL,
	[tname] [varchar](128) NULL,
	[process] [float] NULL,
	[status] [varchar](64) NULL,
	[update_time] [datetime] NULL,
 CONSTRAINT [PK_odm_task] PRIMARY KEY CLUSTERED 
(
	[tid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[user]    Script Date: 2024/12/31 15:06:35 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[user](
	[uid] [varchar](64) NOT NULL,
	[uname] [varchar](64) NOT NULL,
	[pwd] [varchar](64) NOT NULL,
	[first_name] [varchar](64) NULL,
	[last_name] [varchar](64) NULL,
	[email] [varchar](64) NULL,
	[is_staff] [bit] NULL,
	[is_active] [bit] NULL,
	[date_joined] [datetime] NULL,
	[is_superuser] [bit] NULL,
	[last_login] [datetime] NULL,
 CONSTRAINT [PK_user] PRIMARY KEY CLUSTERED 
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[user] ([uid], [uname], [pwd], [first_name], [last_name], [email], [is_staff], [is_active], [date_joined], [is_superuser], [last_login]) VALUES (N'admin-001', N'admin', N'admin123', NULL, NULL, N'admin@example.com', 1, 1, CAST(N'2024-12-30T16:32:45.413' AS DateTime), 1, NULL)
GO
/****** Object:  Index [IDX_image_repo_create_time]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_image_repo_create_time] ON [dbo].[image_repo]
(
	[create_time] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_image_repo_uid]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_image_repo_uid] ON [dbo].[image_repo]
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index [IDX_odm_project_create_time]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_odm_project_create_time] ON [dbo].[odm_project]
(
	[create_time] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_odm_project_uid]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_odm_project_uid] ON [dbo].[odm_project]
(
	[uid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_odm_task_pid]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_odm_task_pid] ON [dbo].[odm_task]
(
	[pid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_odm_task_rid]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_odm_task_rid] ON [dbo].[odm_task]
(
	[rid] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_odm_task_status]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_odm_task_status] ON [dbo].[odm_task]
(
	[status] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ_user_uname]    Script Date: 2024/12/31 15:06:35 ******/
ALTER TABLE [dbo].[user] ADD  CONSTRAINT [UQ_user_uname] UNIQUE NONCLUSTERED 
(
	[uname] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [IDX_user_email]    Script Date: 2024/12/31 15:06:35 ******/
CREATE NONCLUSTERED INDEX [IDX_user_email] ON [dbo].[user]
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[image_repo] ADD  DEFAULT ((0)) FOR [count]
GO
ALTER TABLE [dbo].[image_repo] ADD  DEFAULT (getdate()) FOR [create_time]
GO
ALTER TABLE [dbo].[image_repo] ADD  DEFAULT ((0)) FOR [size]
GO
ALTER TABLE [dbo].[odm_project] ADD  DEFAULT (getdate()) FOR [create_time]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT ((0)) FOR [is_staff]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT (getdate()) FOR [date_joined]
GO
ALTER TABLE [dbo].[user] ADD  DEFAULT ((0)) FOR [is_superuser]
GO
ALTER TABLE [dbo].[image_repo]  WITH CHECK ADD  CONSTRAINT [FK_repo_user] FOREIGN KEY([uid])
REFERENCES [dbo].[user] ([uid])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[image_repo] CHECK CONSTRAINT [FK_repo_user]
GO
ALTER TABLE [dbo].[odm_project]  WITH CHECK ADD  CONSTRAINT [FK_project_user] FOREIGN KEY([uid])
REFERENCES [dbo].[user] ([uid])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[odm_project] CHECK CONSTRAINT [FK_project_user]
GO
USE [master]
GO
ALTER DATABASE [stumdetdb] SET  READ_WRITE 
GO
