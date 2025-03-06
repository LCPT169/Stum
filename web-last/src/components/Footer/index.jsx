import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

const Footer = () => {
  const defaultMessage = '基于无人机影像的山核桃林三维智能分析平台';
  const currentYear = new Date().getFullYear();
  return <DefaultFooter copyright={`${currentYear} ${defaultMessage}`} links={[]} />;
};

export default Footer;
