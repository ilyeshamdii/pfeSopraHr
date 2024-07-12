import { SortByTimestampPipe } from './sort-by-timestamp.pipe';

describe('SortByTimestampPipe', () => {
  it('create an instance', () => {
    const pipe = new SortByTimestampPipe();
    expect(pipe).toBeTruthy();
  });
});
