/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';
import type { PaginationMeta } from '@/types/api.types';

function makeMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    totalItems: 100,
    itemCount: 20,
    itemsPerPage: 20,
    totalPages: 5,
    currentPage: 1,
    ...overrides,
  };
}

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination meta={makeMeta({ totalPages: 1, totalItems: 10 })} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows from–to count text', () => {
    render(<Pagination meta={makeMeta({ currentPage: 2 })} onPageChange={() => {}} />);
    expect(screen.getByText(/21–40 sur 100/)).toBeInTheDocument();
  });

  it('calls onPageChange with next page when next button clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination meta={makeMeta({ currentPage: 2 })} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Page suivante'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with prev page when prev button clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination meta={makeMeta({ currentPage: 3 })} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByLabelText('Page précédente'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables prev button on first page', () => {
    render(<Pagination meta={makeMeta({ currentPage: 1 })} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Page précédente')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination meta={makeMeta({ currentPage: 5, totalPages: 5 })} onPageChange={() => {}} />,
    );
    expect(screen.getByLabelText('Page suivante')).toBeDisabled();
  });

  it('marks current page button with aria-current="page"', () => {
    render(<Pagination meta={makeMeta({ currentPage: 3, totalPages: 5 })} onPageChange={() => {}} />);
    const btn = screen.getByRole('button', { name: '3' });
    expect(btn).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when a page number button is clicked', () => {
    const onPageChange = jest.fn();
    render(<Pagination meta={makeMeta({ currentPage: 1, totalPages: 5 })} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('shows ellipsis for large page ranges', () => {
    render(<Pagination meta={makeMeta({ currentPage: 5, totalPages: 20 })} onPageChange={() => {}} />);
    const ellipsis = screen.getAllByText('…');
    expect(ellipsis.length).toBeGreaterThanOrEqual(1);
  });
});
