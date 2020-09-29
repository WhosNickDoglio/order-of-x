import React from 'react';

const Issue = ({
  id,
  title,
  series,
  dateString,
  thumbnail,
  unlimitedAvailable,
  urls,
  isRead,
  markIssueAsRead,
  toggleIssueRead,
  markReadOnOpen,
  gridView = false,
  toggleWithRightClick,
}) => {
  const onClick = e => {
    if (!unlimitedAvailable) {
      e.preventDefault();
      return false;
    } else if (markReadOnOpen) {
      markIssueAsRead();
    }
  };
  const onRightClick = e => {
    if (!toggleWithRightClick) return;
    e.preventDefault();
    toggleIssueRead(id);
  };
  return (
    <a
      className="issue"
      onClick={onClick}
      onContextMenu={onRightClick}
      target="_blank"
      href={
        unlimitedAvailable
          ? `https://read.marvel.com/#/book/${id}?utm_campaign=apiRef&utm_source=df0ba0393a4a30616885ea8d5ad019db`
          : null
      }
    >
      <img
        className="thumbnail"
        loading="lazy"
        src={thumbnail}
        width="300"
        height="450"
      />
      <div className="title">{title}</div>
      <style jsx>{`
        .issue {
          display: inline-block;
          text-decoration: none;
          margin-right: ${gridView ? 0 : 15}px;
          filter: grayscale(${isRead ? 1 : 0});
          min-width: 0;
          max-width: 200px;
          width: 100%;
          color: black;
          white-space: initial;
          vertical-align: top;
          cursor: ${unlimitedAvailable ? 'pointer' : 'not-allowed'};
        }
        .thumbnail {
          width: 100%;
          height: auto;
          margin-bottom: 5px;
          background-color: #f1f1f1;
        }
        .title {
          font-weight: 600;
          margin-bottom: 3px;
        }
        .series {
          color: #777;
          font-size: 14px;
          margin-bottom: 3px;
        }
        .link:last-of-type {
          margin-right: 0;
        }
      `}</style>
    </a>
  );
};

export default React.memo(Issue);
