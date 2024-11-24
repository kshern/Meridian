import React, { forwardRef } from 'react';
import styles from './MediaItem.module.scss';

interface ImageViewerProps {
    path: string;
    name: string;
    imageClasses: string;
    mediaStyle: React.CSSProperties;
}

const ImageViewer = forwardRef<HTMLImageElement, ImageViewerProps>(({
    path,
    name,
    imageClasses,
    mediaStyle
}, ref) => {
    return (
        <img
            ref={ref}
            src={`file://${path}`}
            alt={name}
            className={imageClasses}
            style={mediaStyle}
            draggable={false}
        />
    );
});

ImageViewer.displayName = 'ImageViewer';

export default ImageViewer;
