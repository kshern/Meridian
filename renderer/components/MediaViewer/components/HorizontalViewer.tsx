// HorizontalViewer.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowPathIcon, MinusIcon, PlusIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import { MediaViewerBaseProps } from '../types';
import MediaItem from './MediaItem';
import styles from '../index.module.scss';

export const HorizontalViewer: React.FC<MediaViewerBaseProps & { onPlayingChange: (isPlaying: boolean) => void }> = ({
    files,
    currentIndex,
    onIndexChange,
    renderLayoutToggle,
    onPlayingChange
}) => {
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);
    const [isWidthFitted, setIsWidthFitted] = useState(false);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
        setIsWidthFitted(false);
    }, [currentIndex]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            if (imageRef.current && containerRef.current) {
                e.preventDefault();
                const delta = e.deltaY;
                const scaleChange = delta > 0 ? 0.9 : 1.1; // 缩小或放大10%
                const newScale = scale * scaleChange;

                // 获取图片和容器的尺寸
                const img = imageRef.current;
                const container = containerRef.current;
                const containerRect = container.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();

                // 计算最小缩放比例，确保图片至少填满容器的宽度或高度
                const minScaleWidth = containerRect.width / img.naturalWidth;
                const minScaleHeight = containerRect.height / img.naturalHeight;
                const minScale = Math.min(minScaleWidth, minScaleHeight);

                // 限制缩放范围
                if (newScale >= minScale && newScale <= 5) {
                    // 计算新的尺寸
                    const newWidth = img.naturalWidth * newScale;
                    const newHeight = img.naturalHeight * newScale;

                    // 计算新的位置，保持图片中心点不变
                    const newX = newScale <= 1 ? 0 : Math.min(Math.max(position.x * scaleChange, -(newWidth - containerRect.width) / 2), (newWidth - containerRect.width) / 2);
                    const newY = newScale <= 1 ? 0 : Math.min(Math.max(position.y * scaleChange, -(newHeight - containerRect.height) / 2), (newHeight - containerRect.height) / 2);

                    setScale(newScale);
                    setPosition({ x: newX, y: newY });
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [isWidthFitted, position.y, scale]);


    const handleRotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    const handleZoomIn = useCallback(() => {
        setScale(prev => Math.min(prev * 1.2, 5));
        setIsWidthFitted(false);
    }, []);

    const handleZoomOut = useCallback(() => {
        setScale(prev => Math.max(prev / 1.2, 0.1));
        setIsWidthFitted(false);
    }, []);

    const handleFitWidth = useCallback(() => {
        if (!isWidthFitted) {
            if (imageRef.current && containerRef.current) {
                const imgRect = imageRef.current.getBoundingClientRect();
                const containerRect = containerRef.current.getBoundingClientRect();
                const currentWidth = imgRect.width / scale;
                const newScale = containerRect.width / currentWidth;
                setScale(newScale);

                // 计算图片在新scale下的高度
                const newHeight = imgRect.height * (newScale / scale);
                // 如果图片高度大于容器，将其定位到顶部
                if (newHeight > containerRect.height) {
                    const maxY = (newHeight - containerRect.height) / 2;
                    setPosition({ x: 0, y: maxY });
                } else {
                    setPosition({ x: 0, y: 0 });
                }

                setIsWidthFitted(true);
            }
        } else {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setIsWidthFitted(false);
        }
    }, [scale, isWidthFitted]);


    const handlePrevious = () => {
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : files.length - 1);
    };

    const handleNext = () => {
        onIndexChange(currentIndex < files.length - 1 ? currentIndex + 1 : 0);
    };

    const currentFile = files[currentIndex];

    const renderToolbar = () => (
        <div className={styles.toolbar}>
            <div className={styles.file_counter}>
                {currentIndex + 1} / {files.length}
            </div>
            <div className={styles.top_controls}>
                <button
                    className={styles.layout_toggle}
                    onClick={handleRotate}
                    data-tooltip="旋转"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
                <button
                    className={styles.layout_toggle}
                    onClick={handleZoomOut}
                    data-tooltip="缩小"
                >
                    <MinusIcon className="w-5 h-5" />
                </button>
                <button
                    className={styles.layout_toggle}
                    onClick={handleZoomIn}
                    data-tooltip="放大"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
                <button
                    className={styles.layout_toggle}
                    onClick={handleFitWidth}
                    data-tooltip={isWidthFitted ? "重置" : "横向铺满"}
                >
                    {isWidthFitted ? (
                        <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                        <ArrowsPointingOutIcon className="w-5 h-5 rotate-90" />
                    )}
                </button>
                {renderLayoutToggle?.()}
            </div>
        </div>
    );

    return (
        <div ref={containerRef} className={styles.horizontal_container}>
            {renderToolbar()}
            <button onClick={handlePrevious} className={`${styles.nav_button} ${styles.prev}`}>
                ◀
            </button>
            <button onClick={handleNext} className={`${styles.nav_button} ${styles.next}`}>
                ▶
            </button>
            <MediaItem
                ref={imageRef}
                file={currentFile}
                index={currentIndex}
                currentIndex={currentIndex}
                isDragging={isDragging}
                rotation={rotation}
                scale={scale}
                position={position}
                layoutMode="horizontal"
                onPlayingChange={onPlayingChange}
            />
        </div>
    );
};
