import SeriesList from 'series.json';
import dayjs from 'dayjs';

import Marvel from 'marvel';
const marvel = new Marvel({
  publicKey: process.env.MARVEL_PUBLIC_KEY,
  privateKey: process.env.MARVEL_PRIVATE_KEY,
});

export const getAllIssues = async () => {
  const promises = SeriesList.reverse().map(seriesID =>
    marvel.comics
      .series(seriesID)
      .formatType('comic')
      .noVariants(true)
      .limit(100)
      .get()
  );
  const promiseResults = await Promise.all(promises);
  const results = promiseResults
    .flat()
    .filter(filterIssue)
    .map(formatIssue)
    .sort((a, b) => a.date.localeCompare(b.date));
  return results;
};

export default async (req, res) => {
  const results = await getAllIssues();
  return res.json(results);
};

const filterIssue = issue => {
  return !issue.variantDescription.length;
};

const formatIssue = issue => {
  const date = issue.dates.find(dateItem => dateItem.type == 'onsaleDate').date;
  return {
    id: issue.digitalId,
    title: issue.title,
    series: issue.series.name,
    date: date,
    dateString: dayjs(date).format('MMMM D, YYYY'),
    thumbnail: issue.thumbnail.path + '/portrait_uncanny.jpg',
    unlimitedAvailable: !!issue.dates.find(
      dateItem => dateItem.type == 'unlimitedDate'
    ),
    digitalAvailable: !!issue.dates.find(
      dateItem => dateItem.type == 'digitalPurchaseDate'
    ),
    urls: issue.urls,
  };
};
