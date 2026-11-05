/**
 * Định dạng học phí chuẩn Việt Nam (VND).
 * Quy tắc cốt lõi: Sử dụng non-breaking space (\u00A0) giữa con số và ký hiệu ₫
 * để đảm bảo ký hiệu ₫ tuyệt đối KHÔNG bao giờ bị rớt dòng trên giao diện mobile/màn hình hẹp.
 */
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return 'Miễn phí';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}\u00A0₫`;
};
