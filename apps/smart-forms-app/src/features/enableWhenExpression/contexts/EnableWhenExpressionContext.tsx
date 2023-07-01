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

import type { ReactNode } from 'react';
import { createContext, useState } from 'react';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import type { EnableWhenExpressionContextType } from '../types/enableWhenExpressionContext.type.ts';
import type { EnableWhenExpression } from '../../enableWhen/types/enableWhen.interface.ts';
import { createFhirPathContext } from '../../../utils/fhirpath.ts';

export const EnableWhenExpressionContext = createContext<EnableWhenExpressionContextType>({
  enableWhenExpressions: {},
  initEnableWhenExpressions: () => ({}),
  updateEnableWhenExpressions: () => void 0
});

function EnableWhenExpressionContextProvider(props: { children: ReactNode }) {
  const { children } = props;

  const [items, setItems] = useState<Record<string, EnableWhenExpression>>({});

  const enableWhenExpressionContext: EnableWhenExpressionContextType = {
    enableWhenExpressions: items,
    initEnableWhenExpressions: (
      enableWhenExpressions: Record<string, EnableWhenExpression>,
      questionnaireResponse: QuestionnaireResponse,
      variablesFhirPath: Record<string, Expression[]>
    ) => {
      const initialItems: Record<string, EnableWhenExpression> = { ...enableWhenExpressions };
      if (Object.keys(initialItems).length > 0) {
        const fhirPathContext: Record<string, any> = createFhirPathContext(
          questionnaireResponse,
          variablesFhirPath
        );

        for (const [linkId, enableWhenExpression] of Object.entries(initialItems)) {
          const fhirPathExpression = enableWhenExpression.expression;

          const result = fhirpath.evaluate(
            questionnaireResponse,
            fhirPathExpression,
            fhirPathContext,
            fhirpath_r4_model
          );

          if (result.length > 0) {
            initialItems[linkId].isEnabled = result[0];
          }
        }
        setItems(initialItems);
      }

      return initialItems;
    },
    /**
     * Evaluate all enable when expressions after a change has been made in a questionnaireResponse
     * Evaluation is done using fhirpath.evaluate function
     *
     * @author Sean Fong
     */
    updateEnableWhenExpressions: (
      questionnaireResponse: QuestionnaireResponse,
      variablesFhirPath: Record<string, Expression[]>
    ) => {
      // Evaluate top-level items' variables
      let isUpdated = false;
      const updatedItems = { ...items };
      if (Object.keys(items).length > 0 && questionnaireResponse.item) {
        const fhirPathContext: Record<string, any> = createFhirPathContext(
          questionnaireResponse,
          variablesFhirPath
        );

        for (const [linkId, enableWhenExpression] of Object.entries(updatedItems)) {
          const fhirPathExpression = enableWhenExpression.expression;

          const result = fhirpath.evaluate(
            questionnaireResponse,
            fhirPathExpression,
            fhirPathContext,
            fhirpath_r4_model
          );

          if (result.length > 0) {
            if (items[linkId].isEnabled !== result[0]) {
              isUpdated = true;
              updatedItems[linkId].isEnabled = result[0];
            }
          }
        }
      }

      if (isUpdated) {
        setItems(updatedItems);
      }
    }
  };

  return (
    <EnableWhenExpressionContext.Provider value={enableWhenExpressionContext}>
      {children}
    </EnableWhenExpressionContext.Provider>
  );
}

export default EnableWhenExpressionContextProvider;
