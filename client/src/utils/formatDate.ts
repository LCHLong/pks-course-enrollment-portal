/**
 * Định dạng ngày tháng bắt buộc theo yêu cầu đề bài: YYYY-MM-DD
 * Múi giờ chuẩn: Asia/Ho_Chi_Minh
 */
export const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // Lấy thời gian theo chuẩn YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
