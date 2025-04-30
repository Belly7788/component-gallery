import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  RotateLeftIcon,
  RotateRightIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  FullScreenIcon,
  PlayIcon,
  PauseIcon,
  ZoomInIcon,
  ZoomOutIcon,
  DownloadIcon,
  CloseIcon,
  PreviousIcon,
  NextIcon,
} from './icons'; // Adjust the import path if icons.js is in a different directory
import './styles.css';

const GalleryLightbox = ({ images, initialIndex, onClose, clickedImageRect, galleryId }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [rotation, setRotation] = useState(0);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const lightboxRef = useRef(null);
  const thumbnailRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (thumbnailRef.current) {
      const thumbnail = thumbnailRef.current.children[currentIndex];
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setAnimationClass('slide-in-right');
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
            setZoomLevel(1);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    window.location.hash = `${galleryId}-${currentIndex + 1}`;
  }, [currentIndex, galleryId]);

  useEffect(() => {
    if (animationClass) {
      const timer = setTimeout(() => {
        setAnimationClass('');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [animationClass]);

  const goToPrevious = () => {
    setAnimationClass('slide-in-left');
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setProgress(0);
    setZoomLevel(1);
  };

  const goToNext = () => {
    setAnimationClass('slide-in-right');
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setProgress(0);
    setZoomLevel(1);
  };

  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);
  const flipHorizontal = () => setFlipX((prev) => !prev);
  const flipVertical = () => setFlipY((prev) => !prev);

  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullScreen = () => {
    if (!isFullScreen) {
      lightboxRef.current.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const toggleSlideshow = () => {
    setIsPlaying((prev) => !prev);
    setProgress(0);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex].src;
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - thumbnailRef.current.offsetLeft);
    setScrollLeft(thumbnailRef.current.scrollLeft);
    thumbnailRef.current.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    thumbnailRef.current.style.cursor = 'grab';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    thumbnailRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - thumbnailRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    thumbnailRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 400); // Matches CSS transition duration
  };

  const getInitialTransform = () => {
    if (!clickedImageRect) return {};
    const { top, left, width, height } = clickedImageRect;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scaleX = width / windowWidth;
    const scaleY = height / windowHeight;
    const translateX = left + width / 2 - windowWidth / 2;
    const translateY = top + height / 2 - windowHeight / 2;
    return {
      transform: `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`,
      opacity: 0,
    };
  };

  const getFinalTransform = () => ({
    transform: 'translate(0, 0) scale(1)',
    opacity: 1,
  });

  return (
    <div
      ref={lightboxRef}
      className={`gallery-lightbox ${isVisible ? 'lightbox-enter' : 'lightbox-exit'}`}
      style={isVisible ? getFinalTransform() : getInitialTransform()}
    >
      <div className="lightbox-header">
        {isPlaying && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="header-content">
          <span className="image-counter">
            {currentIndex + 1}/{images.length}
          </span>

          <div className="control-buttons">
            <button
              onClick={rotateLeft}
              className="icon-button"
              title="Rotate Left"
            >
              <RotateLeftIcon />
            </button>
            <button
              onClick={rotateRight}
              className="icon-button"
              title="Rotate Right"
            >
              <RotateRightIcon />
            </button>
            <button
              onClick={flipHorizontal}
              className="icon-button"
              title="Flip Horizontal"
            >
              <FlipHorizontalIcon />
            </button>
            <button
              onClick={flipVertical}
              className="icon-button"
              title="Flip Vertical"
            >
              <FlipVerticalIcon />
            </button>
            <button
              onClick={toggleFullScreen}
              className="icon-button"
              title="Full Screen"
            >
              <FullScreenIcon />
            </button>
            <button
              onClick={toggleSlideshow}
              className="icon-button"
              title="Play/Pause Slideshow"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={zoomIn}
              className="icon-button"
              title="Zoom In"
            >
              <ZoomInIcon />
            </button>
            <button
              onClick={zoomOut}
              className="icon-button"
              title="Zoom Out"
            >
              <ZoomOutIcon />
            </button>
            <button
              onClick={downloadImage}
              className="icon-button"
              title="Download"
            >
              <DownloadIcon />
            </button>
            <button
              onClick={handleClose}
              className="icon-button"
              title="Close"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </div>

      <div className="main-image-container">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].caption || `Image ${currentIndex + 1}`}
          className={`main-image ${animationClass}`}
          style={{
            transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1}) scale(${zoomLevel})`,
          }}
        />
        {images[currentIndex].caption && (
          <p className="caption">{images[currentIndex].caption}</p>
        )}
        <button
          onClick={goToPrevious}
          className="nav-button nav-button-left"
          title="Previous"
        >
          <PreviousIcon />
        </button>
        <button
          onClick={goToNext}
          className="nav-button nav-button-right"
          title="Next"
        >
          <NextIcon />
        </button>
      </div>

      <div className="thumbnail-container-wrapper">
        <div
          ref={thumbnailRef}
          className={`thumbnail-container ${isVisible ? 'animate-slide-up' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {images.map((img, index) => (
            <img
              key={index}
              src={img.src}
              alt={img.caption || `Thumbnail ${index + 1}`}
              className={`thumbnail-image ${index === currentIndex ? 'selected' : ''}`}
              onClick={() => {
                setCurrentIndex(index);
                setProgress(0);
                setZoomLevel(1);
                setAnimationClass(index > currentIndex ? 'slide-in-right' : 'slide-in-left');
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

let root = null;
let container = null;

const initializeGallery = () => {
  const galleries = {};
  let activeGallery = null;
  let initialIndex = 0;
  let clickedImageRect = null;

  const renderLightbox = () => {
    if (!container) {
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);
    }

    if (activeGallery && galleries[activeGallery]) {
      root.render(
        <GalleryLightbox
          images={galleries[activeGallery]}
          initialIndex={initialIndex}
          onClose={() => {
            activeGallery = null;
            clickedImageRect = null;
            window.location.hash = '';
            root.render(null);
          }}
          clickedImageRect={clickedImageRect}
          galleryId={activeGallery}
        />
      );
    } else {
      root.render(null);
    }
  };

  const handleImageClick = (e) => {
    const img = e.target;
    const galleryId = img.getAttribute('data-kheng-chetra') || 'default';
    const src = img.src;
    const galleryImages = galleries[galleryId] || [];
    const index = galleryImages.findIndex((item) => item.src === src);

    if (index !== -1) {
      const rect = img.getBoundingClientRect();
      clickedImageRect = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      initialIndex = index;
      activeGallery = galleryId;
      window.location.hash = `${galleryId}-${index + 1}`;
      renderLightbox();
    }
  };

  const collectImages = () => {
    const imgElements = document.querySelectorAll('img[data-kheng-chetra]');
    const newGalleries = {};

    imgElements.forEach((img) => {
      const galleryId = img.getAttribute('data-kheng-chetra') || 'default';
      const caption = img.getAttribute('data-caption') || img.alt || '';

      if (!newGalleries[galleryId]) {
        newGalleries[galleryId] = [];
      }

      newGalleries[galleryId].push({
        src: img.src,
        caption,
      });

      img.style.cursor = 'pointer';
      img.addEventListener('click', handleImageClick);
    });

    Object.assign(galleries, newGalleries);
  };

  const handleHashChange = () => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const [galleryId, indexStr] = hash.split('-');
      const index = parseInt(indexStr) - 1;
      if (galleries[galleryId] && index >= 0 && index < galleries[galleryId].length) {
        activeGallery = galleryId;
        initialIndex = index;
        clickedImageRect = null;
        renderLightbox();
      }
    } else {
      activeGallery = null;
      renderLightbox();
    }
  };

  collectImages();
  window.addEventListener('hashchange', handleHashChange);

  const hash = window.location.hash.slice(1);
  if (hash) {
    const [galleryId, indexStr] = hash.split('-');
    const index = parseInt(indexStr) - 1;
    if (galleries[galleryId] && index >= 0 && index < galleries[galleryId].length) {
      activeGallery = galleryId;
      initialIndex = index;
      clickedImageRect = null;
      renderLightbox();
    }
  }

  const observer = new MutationObserver(() => {
    collectImages();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    window.removeEventListener('hashchange', handleHashChange);
    const imgElements = document.querySelectorAll('img[data-kheng-chetra]');
    imgElements.forEach((img) => {
      img.removeEventListener('click', handleImageClick);
    });
    observer.disconnect();
    if (root) {
      root.render(null);
      root = null;
    }
    if (container) {
      document.body.removeChild(container);
      container = null;
    }
  };
};

let cleanup = null;
if (!cleanup) {
  cleanup = initializeGallery();
}

const GalleryBelly = () => null;
export default GalleryBelly;
