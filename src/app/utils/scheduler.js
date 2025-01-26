import { POSTING_TIMES } from '@/app/config/admin';

export const getNextPostingTime = () => {
  const now = new Date();
  const [firstHour, firstMinute] = POSTING_TIMES.FIRST_BLOCK.split(':').map(Number);
  const [secondHour, secondMinute] = POSTING_TIMES.SECOND_BLOCK.split(':').map(Number);

  const firstBlock = new Date(now);
  firstBlock.setHours(firstHour, firstMinute, 0, 0);

  const secondBlock = new Date(now);
  secondBlock.setHours(secondHour, secondMinute, 0, 0);

  if (now < firstBlock) return 'Your tweet will be posted today at 8:00 PM';
  if (now < secondBlock) return 'Your tweet will be posted today at 10:00 PM';
  return 'Your tweet will be posted tomorrow at 8:00 PM';
};
