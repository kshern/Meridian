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
            if (isWidthFitted && imageRef.current) {
                const imgRect = imageRef.current.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                if (imgRect.height > containerRect.height) {
                    e.preventDefault();
                    const deltaY = e.deltaY;
                    const maxY = Math.max(0, (imgRect.height - containerRect.height) / 2);
                    let newY = position.y - deltaY;
                    newY = Math.min(Math.max(newY, -maxY), maxY);
                    setPosition(prev => ({ ...prev, y: newY }));
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
        };
    }, [isWidthFitted, position.y]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1 && imageRef.current && containerRef.current) {
            const imgRect = imageRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            const canDragX = imgRect.width > containerRect.width;
            const canDragY = imgRect.height > containerRect.height;

            if (canDragX || canDragY) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
            }
        }
    }, [scale, position]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1 && imageRef.current && containerRef.current) {
            const imgRect = imageRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            let newX = e.clientX - dragStart.x;
            let newY = e.clientY - dragStart.y;

            const scaledWidth = imgRect.width;
            const scaledHeight = imgRect.height;

            const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
            const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

            if (scaledWidth > containerRect.width) {
                newX = Math.min(Math.max(newX, -maxX), maxX);
            } else {
                newX = 0;
            }

            if (scaledHeight > containerRect.height) {
                newY = Math.min(Math.max(newY, -maxY), maxY);
            } else {
                newY = 0;
            }

            setPosition({ x: newX, y: newY });
        }
    }, [isDragging, scale, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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
                handleMouseDown={handleMouseDown}
                handleMouseMove={handleMouseMove}
                handleMouseUp={handleMouseUp}
                onPlayingChange={onPlayingChange}
            />
        </div>
    );
};
