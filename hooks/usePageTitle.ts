'use client';

import { useEffect } from 'react';

const SITE_NAME = 'The Perfume Empire';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Perfumes in East Legon, Accra`;
  }, [title]);
}
