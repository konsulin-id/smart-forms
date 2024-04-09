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

import type { EnableWhenExpression } from '../interfaces';
import type { Expression, QuestionnaireResponse } from 'fhir/r4';
import { createFhirPathContext } from './fhirpath';
import fhirpath from 'fhirpath';
import fhirpath_r4_model from 'fhirpath/fhir-context/r4';
import _isEqual from 'lodash/isEqual';
import { emptyResponse } from './emptyResource';
import cloneDeep from 'lodash.clonedeep';

interface EvaluateInitialEnableWhenExpressionsParams {
  initialResponse: QuestionnaireResponse;
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  variablesFhirPath: Record<string, Expression[]>;
  existingFhirPathContext: Record<string, any>;
}

export function evaluateInitialEnableWhenExpressions(
  params: EvaluateInitialEnableWhenExpressionsParams
): {
  initialEnableWhenExpressions: Record<string, EnableWhenExpression>;
  updatedFhirPathContext: Record<string, any>;
} {
  const { initialResponse, enableWhenExpressions, variablesFhirPath, existingFhirPathContext } =
    params;

  // Return early if initialResponse is empty or there are no enableWhen expressions to evaluate
  if (
    _isEqual(initialResponse, cloneDeep(emptyResponse)) ||
    Object.keys(enableWhenExpressions).length === 0
  ) {
    return {
      initialEnableWhenExpressions: enableWhenExpressions,
      updatedFhirPathContext: existingFhirPathContext
    };
  }

  const initialEnableWhenExpressions: Record<string, EnableWhenExpression> = {
    ...enableWhenExpressions
  };
  const updatedFhirPathContext = createFhirPathContext(
    initialResponse,
    variablesFhirPath,
    existingFhirPathContext
  );

  for (const linkId in initialEnableWhenExpressions) {
    try {
      const result = fhirpath.evaluate(
        initialResponse,
        enableWhenExpressions[linkId].expression,
        updatedFhirPathContext,
        fhirpath_r4_model
      );

      // Update enableWhenExpressions if length of result array > 0
      if (result.length > 0) {
        updateEnableWhenExpressionStatus(initialEnableWhenExpressions, linkId, result);
      }

      // handle intersect edge case - evaluate() returns empty array if result is false
      if (enableWhenExpressions[linkId].expression.includes('intersect') && result.length === 0) {
        initialEnableWhenExpressions[linkId].isEnabledSingle = false;
      }
    } catch (e) {
      console.warn(
        e.message,
        `LinkId: ${linkId}\nExpression: ${enableWhenExpressions[linkId].expression}`
      );
    }
  }

  return {
    initialEnableWhenExpressions,
    updatedFhirPathContext
  };
}

export function evaluateEnableWhenExpressions(
  fhirPathContext: Record<string, any>,
  enableWhenExpressions: Record<string, EnableWhenExpression>
): {
  enableWhenExpsIsUpdated: boolean;
  updatedEnableWhenExpressions: Record<string, EnableWhenExpression>;
} {
  const updatedEnableWhenExpressions: Record<string, EnableWhenExpression> = {
    ...enableWhenExpressions
  };

  let isUpdated = false;
  for (const linkId in updatedEnableWhenExpressions) {
    try {
      const result = fhirpath.evaluate(
        '',
        enableWhenExpressions[linkId].expression,
        fhirPathContext,
        fhirpath_r4_model
      );

      // Update enableWhenExpressions if length of result array > 0
      if (result.length > 0) {
        isUpdated = updateEnableWhenExpressionStatus(updatedEnableWhenExpressions, linkId, result);
      }

      // handle intersect edge case - evaluate() returns empty array if result is false
      if (enableWhenExpressions[linkId].expression.includes('intersect') && result.length === 0) {
        updatedEnableWhenExpressions[linkId].isEnabledSingle = false;
      }
    } catch (e) {
      console.warn(
        e.message,
        `LinkId: ${linkId}\nExpression: ${enableWhenExpressions[linkId].expression}`
      );
    }
  }

  return {
    enableWhenExpsIsUpdated: isUpdated,
    updatedEnableWhenExpressions: updatedEnableWhenExpressions
  };
}

function updateEnableWhenExpressionStatus(
  enableWhenExpressions: Record<string, EnableWhenExpression>,
  linkId: string,
  result: any[]
): boolean {
  // Values are not fully boolean, expression is invalid
  const everyResultIsBoolean = result.every((r) => typeof r === 'boolean');
  if (!everyResultIsBoolean) {
    return false;
  }

  // If result has multiple values
  if (result.length > 1) {
    if (enableWhenExpressions[linkId].isEnabledMultiple !== result) {
      enableWhenExpressions[linkId].isEnabledMultiple = result;
      return true;
    }
  }

  // If result has only one value
  if (enableWhenExpressions[linkId].isEnabledSingle !== result[0]) {
    enableWhenExpressions[linkId].isEnabledSingle = result[0];
    return true;
  }

  return false;
}
