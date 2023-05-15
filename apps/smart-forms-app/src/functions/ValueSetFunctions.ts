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

import type { Coding, Expression, Extension, QuestionnaireItem, ValueSet } from 'fhir/r4';
import * as FHIR from 'fhirclient';
import type { ValueSetPromise, VariableXFhirQuery } from '../interfaces/Interfaces';

const ONTOSERVER_ENDPOINT =
  import.meta.env.VITE_ONTOSERVER_URL ?? 'https://r4.ontoserver.csiro.au/fhir/';

const VALID_VALUE_SET_URL_REGEX =
  /https?:\/\/(www\.)?[-\w@:%.+~#=]{2,256}\.[a-z]{2,4}\b([-@\w:%+.~#?&/=]*ValueSet[-@\w:%+.~#?&/=]*)/;

const VALID_FHIRPATH_VARIABLE_REGEX = /%(.*?)\./;

export function getTerminologyServerUrl(qItem: QuestionnaireItem): string | undefined {
  const itemControl = qItem.extension?.find(
    (extension: Extension) =>
      extension.url === 'http://hl7.org/fhir/StructureDefinition/terminology-server'
  );
  if (itemControl) {
    return itemControl.valueUrl;
  }
  return undefined;
}

export function getValueSetPromise(url: string, terminologyServer?: string): Promise<ValueSet> {
  let valueSetUrl = url;

  if (url.includes('ValueSet/$expand?url=')) {
    const splitUrl = url.split('ValueSet/$expand?url=');
    terminologyServer = splitUrl[0];
    valueSetUrl = splitUrl[1];
  }

  valueSetUrl = valueSetUrl.replace('|', '&version=');

  return FHIR.client({ serverUrl: terminologyServer ?? ONTOSERVER_ENDPOINT }).request({
    url: 'ValueSet/$expand?url=' + valueSetUrl
  });
}

/**
 * Sets an array of codings with the values from a valueSet
 *
 * @author Sean Fong
 */
export function getValueSetUrlFromContained(valueSet: ValueSet): string {
  const urls = valueSet.compose?.include?.map((include) =>
    include.valueSet?.[0] ? include.valueSet[0] : ''
  );

  return urls && urls.length > 0 ? urls[0] : '';
}

export async function resolvePromises(
  valueSetPromises: Record<string, ValueSetPromise>
): Promise<Record<string, ValueSetPromise>> {
  const newValueSetPromises: Record<string, ValueSetPromise> = {};

  const valueSetPromiseKeys = Object.keys(valueSetPromises);
  const valueSetPromiseValues = Object.values(valueSetPromises);
  const promises = valueSetPromiseValues.map((valueSetPromise) => valueSetPromise.promise);

  const settledPromises = await Promise.allSettled(promises);

  for (const [i, settledPromise] of settledPromises.entries()) {
    // Only add valueSet if the promise was fulfilled
    if (settledPromise.status === 'fulfilled') {
      const valueSet = settledPromise.value;
      const key = valueSetPromiseKeys[i];
      const valueSetPromise = valueSetPromiseValues[i];

      if (key && valueSetPromise) {
        valueSetPromise.valueSet = valueSet;
        newValueSetPromises[key] = valueSetPromise;
      }
    }
  }
  return newValueSetPromises;
}

/**
 * Sets an array of codings with the values from a valueSet
 *
 * @author Sean Fong
 */
export function getValueSetCodings(valueSet: ValueSet): Coding[] {
  return valueSet.expansion?.contains?.map((coding) => coding) ?? [];
}

/**
 * Evaluate valueSets in answerExpression with fhirpath
 *
 * @author Sean Fong
 */
export function evaluateAnswerExpressionValueSet(
  answerExpression: Expression,
  itemLevelVariables: Expression[],
  preprocessedCodings: Record<string, Coding[]>
): Coding[] {
  const expression = answerExpression.expression;
  if (!expression) return [];

  const match = expression.match(VALID_FHIRPATH_VARIABLE_REGEX);
  const variableName = match?.[1];
  if (!variableName) return [];

  const matchedVariable = itemLevelVariables?.find((variable) => variable.name === variableName);
  if (!matchedVariable) return [];

  const valueSetExpression = matchedVariable.expression;
  if (!valueSetExpression) return [];

  if (!VALID_VALUE_SET_URL_REGEX.test(valueSetExpression)) return [];

  return preprocessedCodings[valueSetExpression] ?? [];
}

export function createValueSetToXFhirQueryVariableNameMap(
  variables: Record<string, VariableXFhirQuery>
): Record<string, string> {
  const valueSetToNameMap: Record<string, string> = {};
  for (const [name, variable] of Object.entries(variables)) {
    const expressionStr = variable.valueExpression.expression;
    if (expressionStr && VALID_VALUE_SET_URL_REGEX.test(expressionStr)) {
      valueSetToNameMap[expressionStr] = name;
    }
  }
  return valueSetToNameMap;
}
