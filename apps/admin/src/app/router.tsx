import { createBrowserRouter } from 'react-router-dom';
import { IssueCenterPage } from '../pages/issue-center/IssueCenterPage';
import { IssueDetailPage } from '../pages/issue-detail/IssueDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <IssueCenterPage />,
  },
  {
    path: '/issues/:issueId',
    element: <IssueDetailPage />,
  },
]);
