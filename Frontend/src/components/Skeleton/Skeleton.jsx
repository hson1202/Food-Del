import React from 'react';
import './Skeleton.css';

/**
 * Skeleton Card Component - Loading placeholder cho product card
 */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton-footer">
        <div className="skeleton skeleton-price"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  </div>
);

/**
 * Skeleton Grid - Grid of loading cards
 */
export const SkeletonGrid = ({ count = 8 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

/**
 * Skeleton List Item - For list view (Admin)
 */
export const SkeletonListItem = () => (
  <div className="skeleton-list-item">
    <div className="skeleton skeleton-list-image"></div>
    <div className="skeleton skeleton-list-name"></div>
    <div className="skeleton skeleton-list-category"></div>
    <div className="skeleton skeleton-list-price"></div>
    <div className="skeleton skeleton-list-action"></div>
  </div>
);

/**
 * Skeleton List - Multiple list items
 */
export const SkeletonList = ({ count = 5 }) => (
  <div className="skeleton-list">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonListItem key={index} />
    ))}
  </div>
);

/**
 * Skeleton Category - For category tabs
 */
export const SkeletonCategory = ({ count = 6 }) => (
  <div className="skeleton-categories">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="skeleton skeleton-category-item"></div>
    ))}
  </div>
);

/**
 * Skeleton Product Detail - For product popup
 */
export const SkeletonProductDetail = () => (
  <div className="skeleton-product-detail">
    <div className="skeleton-detail-image">
      <div className="skeleton skeleton-image-large"></div>
    </div>
    <div className="skeleton-detail-info">
      <div className="skeleton skeleton-title-large"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
      <div className="skeleton skeleton-price-large"></div>
      <div className="skeleton skeleton-button-large"></div>
    </div>
  </div>
);

export default SkeletonCard;

