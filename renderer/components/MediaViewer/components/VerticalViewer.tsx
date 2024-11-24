import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaViewerBaseProps } from '../types';
import MediaItem from './MediaItem';
import styles from '../index.module.scss';

export const VerticalViewer: React.FC<MediaViewerBaseProps> = ({
    files,
    currentIndex,
    onIndexChange,
    renderLayoutToggle
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mediaRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const initialScrollDone = useRef(false);

    useEffect(() => {
        // 确保在垂直模式下正确定位到当前index
        if (!initialScrollDone.current) {
            requestAnimationFrame(() => {
                const element = mediaRefs.current.get(currentIndex);
                if (element) {
                    element.scrollIntoView({ behavior: 'instant', block: 'start' });
                    initialScrollDone.current = true;
                }
            });
        }
    }, []);

    useEffect(() => {
        // 当 currentIndex 改变时滚动到对应位置
        const element = mediaRefs.current.get(currentIndex);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentIndex]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (!initialScrollDone.current) return;

        const container = e.currentTarget;
        const items = Array.from(mediaRefs.current.values());
        const containerRect = container.getBoundingClientRect();

        // 找到最接近容器顶部的元素
        let minDistance = Infinity;
        let closestIndex = currentIndex;

        items.forEach((item) => {
            const itemRect = item.getBoundingClientRect();
            // 计算元素顶部与容器顶部的距离
            const distance = Math.abs(itemRect.top - containerRect.top);

            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = parseInt(item.getAttribute('data-index') || '0');
            }
        });
        if (closestIndex !== currentIndex) {
            onIndexChange(closestIndex);
        }
    }, [currentIndex, onIndexChange]);

    const renderToolbar = () => (
        <div className={styles.toolbar}>
            <div className={styles.file_counter}>
                {currentIndex + 1} / {files.length}
            </div>
            <div className={styles.top_controls}>
                {renderLayoutToggle?.()}
            </div>
        </div>
    );

    return (
        <div className={styles.vertical_viewer_container} style={{ height: '100%', overflow: 'auto' }}>
            {renderToolbar()}
            <div
                ref={containerRef}
                className={styles.vertical_container}
                onScroll={handleScroll}
                style={{ height: 'calc(100% - 64px)', overflow: 'auto' }}
            >
                {files.map((file, index) => (
                    <div
                        key={file.path}
                        ref={(el) => {
                            if (el) {
                                mediaRefs.current.set(index, el);
                            } else {
                                mediaRefs.current.delete(index);
                            }
                        }}
                        data-index={index}
                    >
                        <MediaItem
                            file={file}
                            index={index}
                            currentIndex={currentIndex}
                            isDragging={false}
                            rotation={0}
                            scale={1}
                            position={{ x: 0, y: 0 }}
                            layoutMode="vertical"
                                />
                    </div>
                ))}
            </div>
        </div>
    );
};