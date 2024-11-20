
import classnames from 'classnames/bind';
import type { ReactNode } from 'react';
import styles from './index.module.scss';
import React from 'react';
const cn = classnames.bind(styles);
interface PageContainerProps {
  children: ReactNode;
}
/**
 * 页面容器组件，用于包裹页面的主要内容和侧边栏。
 * @param {Object} props - 组件的属性。
 * @param {ReactNode} props.children - 要在页面内容区域显示的子组件。
 * @returns {JSX.Element} - 渲染的页面容器组件。
 */
export default function PageContainer(props: PageContainerProps) {
  const { children } = props;
  return (<>{children}
  </>)
}
