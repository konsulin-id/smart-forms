/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState } from 'react';
import { CachedQueriedValueSetContextType } from '../interfaces/ContextTypes';
import { Coding } from 'fhir/r5';

export const CachedQueriedValueSetContext = React.createContext<CachedQueriedValueSetContextType>({
  cachedValueSetCodings: {},
  addCodingToCache: () => void 0
});

function CachedQueriedValueSetContextProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const [cachedCodings, setCachedCodings] = useState<Record<string, Coding[]>>({});

  const cachedQueriedValueSetContext: CachedQueriedValueSetContextType = {
    cachedValueSetCodings: cachedCodings,
    addCodingToCache: (valueSetUrl: string, codings: Coding[]) => {
      const newCachedCodings = { ...cachedCodings };
      newCachedCodings[valueSetUrl] = codings;
      setCachedCodings(newCachedCodings);
    }
  };

  return (
    <CachedQueriedValueSetContext.Provider value={cachedQueriedValueSetContext}>
      {children}
    </CachedQueriedValueSetContext.Provider>
  );
}

export default CachedQueriedValueSetContextProvider;
