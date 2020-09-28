import React, { useEffect, useState, useMemo } from 'react';
import Page from 'components/Page';
import Issue from 'components/Issue';
import Fuse from 'fuse.js';
import dayjs from 'dayjs';
import createPersistedState from 'use-persisted-state';
const useSearchFilterState = createPersistedState('searchFilter');
const useOptionsState = createPersistedState('options');
const useHiddenSeriesState = createPersistedState('hiddenSeries');
const useGroupByState = createPersistedState('groupBy');
const useReadIssues = createPersistedState('readIssues');
import { getAllIssues } from 'pages/api/home';
import Head from 'next/head';

export const getStaticProps = async () => {
  const issues = await getAllIssues();
  const series = issues.reduce((list, currentIssue) => {
    if (!list.includes(currentIssue.series)) list.push(currentIssue.series);
    return list;
  }, []);
  const dates = issues.reduce((list, currentIssue) => {
    if (!list.includes(currentIssue.dateString))
      list.push(currentIssue.dateString);
    return list;
  }, []);
  return { props: { series, dates, issues }, revalidate: 60 * 60 * 6 };
};

const IndexPage = ({ series, dates, issues }) => {
  const fuse = new Fuse(issues, {
    keys: ['title'],
    shouldSort: false,
    findAllMatches: true,
    threshold: 0.2,
  });
  const [readIssues, setReadIssues] = useReadIssues([]);
  const [searchFilter, setSearchFilter] = useSearchFilterState('');
  const [hiddenSeries, setHiddenSeries] = useHiddenSeriesState([]);
  const [groupBy, setGroupBy] = useGroupByState('Release Date');
  const [options, setOptions] = useOptionsState({
    hideRead: true,
    hideUnreleased: false,
    hideUnavailable: false,
    markReadOnOpen: false,
    toggleWithRightClick: true,
  });
  const resetData = () => {
    if (!confirm('Are you sure you want to clear your reading list?')) return;
    setOptions({
      hideRead: true,
      hideUnreleased: false,
      hideUnavailable: false,
      markReadOnOpen: false,
      toggleWithRightClick: true,
    });
    setReadIssues([]);
    setSearchFilter('');
    setHiddenSeries([]);
  };
  const [mounted, setMounted] = useState();
  useEffect(() => {
    setMounted(true);
  }, []);
  const filteredIssues = useMemo(
    () =>
      (mounted && searchFilter.length
        ? fuse.search(searchFilter).map(i => i.item)
        : issues
      )
        .filter(issue => {
          return (
            !hiddenSeries.includes(issue.series) &&
            (options.hideRead ? !readIssues.includes(issue.id) : true) &&
            (options.hideUnavailable ? issue.unlimitedAvailable : true) &&
            (options.hideUnreleased
              ? dayjs(issue.date).isBefore(dayjs())
              : true)
          );
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [mounted, hiddenSeries, searchFilter, options, readIssues]
  );
  const markIssueAsRead = issueID => {
    console.log('mark read', issueID);
    setReadIssues(readIssues => [...readIssues, issueID]);
  };
  const toggleIssueRead = issueID => {
    if (readIssues.includes(issueID)) {
      setReadIssues(readIssues => [...readIssues.filter(i => i != issueID)]);
    } else markIssueAsRead(issueID);
  };

  return (
    <Page>
      <Head>
        <title>Order of X</title>
      </Head>
      <div className="index">
        <div className="series">
          <div className="series-inner">
            <h1>Order of X</h1>
            <h2>
              An unofficial helper for reading the current X-Men run in Marvel
              Unlimited.
            </h2>
            <input
              type="text"
              className="search-filter"
              placeholder={
                mounted ? `Filter from ${filteredIssues.length} issues...` : ''
              }
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
            <div className="filter-header">Options</div>
            <label className="series-option">
              <input
                type="checkbox"
                checked={options.hideRead}
                onChange={() =>
                  setOptions(options => ({
                    ...options,
                    hideRead: !options.hideRead,
                  }))
                }
              />{' '}
              Hide read issues
            </label>
            <label className="series-option">
              <input
                type="checkbox"
                checked={options.hideUnavailable}
                onChange={() =>
                  setOptions(options => ({
                    ...options,
                    hideUnavailable: !options.hideUnavailable,
                  }))
                }
              />{' '}
              Hide unavailable issues
            </label>
            <label className="series-option">
              <input
                type="checkbox"
                checked={options.hideUnreleased}
                onChange={() =>
                  setOptions(options => ({
                    ...options,
                    hideUnreleased: !options.hideUnreleased,
                  }))
                }
              />{' '}
              Hide unreleased issues
            </label>
            <label className="series-option">
              <input
                type="checkbox"
                checked={options.markReadOnOpen}
                onChange={() =>
                  setOptions(options => ({
                    ...options,
                    markReadOnOpen: !options.markReadOnOpen,
                  }))
                }
              />{' '}
              Mark as read on open
            </label>
            <label className="series-option">
              <input
                type="checkbox"
                checked={options.toggleWithRightClick}
                onChange={() =>
                  setOptions(options => ({
                    ...options,
                    toggleWithRightClick: !options.toggleWithRightClick,
                  }))
                }
              />{' '}
              Toggle read with right click
            </label>
            <div className="filter-header">Group by</div>
            <label className="series-option">
              <input
                type="radio"
                checked={groupBy == 'None'}
                onChange={() => setGroupBy('None')}
              />{' '}
              None
            </label>
            <label className="series-option">
              <input
                type="radio"
                checked={groupBy == 'Release Date'}
                onChange={() => setGroupBy('Release Date')}
              />{' '}
              Date
            </label>

            <div className="filter-header">Filter by Series</div>
            {series.map(seriesItem => (
              <label className="series-option" key={seriesItem}>
                <input
                  type="checkbox"
                  checked={!hiddenSeries.includes(seriesItem)}
                  onChange={() =>
                    hiddenSeries.includes(seriesItem)
                      ? setHiddenSeries(issues =>
                          issues.filter(item => item != seriesItem)
                        )
                      : setHiddenSeries(issues => [...issues, seriesItem])
                  }
                />{' '}
                {seriesItem}
              </label>
            ))}
            <button className="reset" onClick={resetData}>
              Reset data
            </button>
            <div className="credit">Data provided by Marvel. © 2014 Marvel</div>
          </div>
        </div>
        <div className="issues">
          {!mounted ? null : groupBy == 'None' ? (
            <div className="issue-grid">
              {filteredIssues.map(issue => (
                <Issue
                  key={`${issue.id}_${issue.title}`}
                  gridView
                  isRead={readIssues.includes(issue.id)}
                  toggleWithRightClick={options.toggleWithRightClick}
                  toggleIssueRead={toggleIssueRead}
                  markReadOnOpen={options.markReadOnOpen}
                  markIssueAsRead={() => markIssueAsRead(issue.id)}
                  {...issue}
                />
              ))}
            </div>
          ) : (
            dates.map(date => {
              const issues = filteredIssues.filter(
                issue => issue.dateString == date
              );
              return issues.length ? (
                <div className="issue-group" key={date}>
                  <h3>{date}</h3>
                  <div className="issues-list">
                    {issues.map(issue => (
                      <Issue
                        key={`${issue.id}_${issue.title}`}
                        isRead={readIssues.includes(issue.id)}
                        toggleWithRightClick={options.toggleWithRightClick}
                        toggleIssueRead={toggleIssueRead}
                        markReadOnOpen={options.markReadOnOpen}
                        markIssueAsRead={() => markIssueAsRead(issue.id)}
                        {...issue}
                      />
                    ))}
                  </div>
                </div>
              ) : null;
            })
          )}
        </div>
        <style jsx>{`
          .index {
            display: grid;
            grid-template-columns: 300px 1fr;
          }
          .series {
          }
          h1 {
            font-size: 18px;
            margin-bottom: 5px;
          }
          h2 {
            font-weight: normal;
            color: #777;
            line-height: 1.3em;
            margin-bottom: 10px;
          }
          .filter-header {
            padding: 5px 0;
            font-weight: 500;
            margin-top: 10px;
            border-bottom: 1px solid #ddd;
          }
          .series-inner {
            padding: 20px;
            position: sticky;
            top: 0;
            font-size: 14px;
          }
          .search-filter {
            padding: 10px;
            font-size: 14px;
            width: 100%;
            margin-bottom: 5px;
            outline: none;
            border: 1px solid #ddd;
            border-radius: 3px;
          }
          .series-option {
            display: block;
            padding: 5px 5px;
            cursor: pointer;
            margin: 0 -5px;
          }
          .credit {
            font-size: 12px;
            margin-top: 20px;
          }
          .series-option:hover {
            background: #f1f1f1;
          }
          .issues {
            padding: 20px;
            min-width: 0;
            opacity: ${mounted ? 1 : 0};
          }
          .issues-group {
          }
          .reset {
            margin-top: 20px;
          }
          h3 {
            font-size: 24px;
            color: #333;
            font-weight: 500;
            margin-bottom: 15px;
          }
          .issues-list {
            width: calc(100% + 40px);
            white-space: nowrap;
            overflow-x: auto;
            margin: 0 -20px;
            padding: 0 20px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid #ddd;
          }
          .issue-grid {
            display: grid;
            grid-gap: 10px;

            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
          @media (max-width: 768px) {
            .index {
              display: block;
            }
          }
        `}</style>
      </div>
    </Page>
  );
};

export default IndexPage;
