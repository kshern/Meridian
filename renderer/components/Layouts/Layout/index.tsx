import classnames from 'classnames/bind';
import type { ReactNode } from 'react';
import styles from './index.module.scss';
import React from 'react';
const cn = classnames.bind(styles);

interface LayoutProps {
  children: ReactNode;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;
  return <div className={cn('layout')}>
    <>{children}</>
  </div>
}
