/*
 * Copyright 2024 Commonwealth Scientific and Industrial Research
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

import { useEffect, useState } from 'react';
import { createEmptyQrItem } from '../utils/qrItem';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { useQuestionnaireStore } from '../stores';

interface UseBooleanCalculatedExpression {
  calcExpUpdated: boolean;
}

interface UseBooleanCalculatedExpressionProps {
  qItem: QuestionnaireItem;
  booleanValue: boolean | undefined;
  onQrItemChange: (qrItem: QuestionnaireResponseItem) => void;
}

function UseBooleanCalculatedExpression(
  props: UseBooleanCalculatedExpressionProps
): UseBooleanCalculatedExpression {
  const { qItem, booleanValue, onQrItemChange } = props;

  const calculatedExpressions = useQuestionnaireStore.use.calculatedExpressions();

  const [calcExpUpdated, setCalcExpUpdated] = useState(false);

  useEffect(
    () => {
      const calcExpression = calculatedExpressions[qItem.linkId]?.find(
        (exp) => exp.from === 'item'
      );

      if (!calcExpression) {
        return;
      }

      // only update if calculated value is different from current value
      if (calcExpression.value !== booleanValue && typeof calcExpression.value === 'boolean') {
        // update ui to show calculated value changes
        setCalcExpUpdated(true);
        setTimeout(() => {
          setCalcExpUpdated(false);
        }, 500);

        // update questionnaireResponse
        onQrItemChange({
          ...createEmptyQrItem(qItem),
          answer: [{ valueBoolean: calcExpression.value }]
        });
      }
    },
    // Only trigger this effect if calculatedExpression of item changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [calculatedExpressions]
  );

  return { calcExpUpdated: calcExpUpdated };
}

export default UseBooleanCalculatedExpression;