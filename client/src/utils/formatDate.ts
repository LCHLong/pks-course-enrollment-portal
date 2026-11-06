/**
 * Định dạng ngày tháng bắt buộc theo yêu cầu đề bài: YYYY-MM-DD
 * Múi giờ chuẩn: Asia/Ho_Chi_Minh
 */
export function formatDate(dateString: string | Date): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
}
