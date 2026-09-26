// A corpus line is "nums1|nums2"; the stage takes up to 8 values in each.
export const input = (c) => {
  const [nums1, nums2] = c.split('|').map((s) => (s ? s.split(',').map(Number) : []));
  return nums1.length <= 8 && nums2.length <= 8 ? { nums1, nums2 } : null;
};
export const answer = (s) => (s.finished ? s.median.toFixed(5) : 'NOT FINISHED');
