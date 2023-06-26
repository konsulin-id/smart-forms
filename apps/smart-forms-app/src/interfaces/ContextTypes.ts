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

import type {
  Coding,
  Encounter,
  Expression,
  Patient,
  Practitioner,
  QuestionnaireResponse,
  QuestionnaireResponseItemAnswer
} from 'fhir/r4';
import type Client from 'fhirclient/lib/Client';
import type {
  CalculatedExpression,
  EnableWhenExpression,
  EnableWhenItemProperties,
  EnableWhenItems,
  Renderer
} from './Interfaces';
import type { MutableRefObject } from 'react';

export type EnableWhenContextType = {
  items: Record<string, EnableWhenItemProperties>;
  linkMap: Record<string, string[]>;
  isActivated: boolean;
  setItems: (
    enableWhenItems: EnableWhenItems,
    questionnaireResponse: QuestionnaireResponse
  ) => unknown;
  updateItem: (linkId: string, newAnswer: QuestionnaireResponseItemAnswer[]) => unknown;
  toggleActivation: (toggled: boolean) => unknown;
};

export type SmartAppLaunchContextType = {
  fhirClient: Client | null;
  patient: Patient | null;
  user: Practitioner | null;
  encounter: Encounter | null;
  setFhirClient: (client: Client) => unknown;
  setPatient: (patient: Patient) => unknown;
  setUser: (user: Practitioner) => unknown;
  setEncounter: (user: Encounter) => unknown;
};

export type CachedQueriedValueSetContextType = {
  cachedValueSetCodings: Record<string, Coding[]>;
  addCodingToCache: (valueSetUrl: string, codings: Coding[]) => unknown;
};

export type CalculatedExpressionContextType = {
  calculatedExpressions: Record<string, CalculatedExpression>;
  updateCalculatedExpressions: (
    questionnaireResponse: QuestionnaireResponse,
    variablesFhirPath: Record<string, Expression[]>
  ) => unknown;
};

export type EnableWhenExpressionContextType = {
  enableWhenExpressions: Record<string, EnableWhenExpression>;
  initEnableWhenExpressions: (
    enableWhenExpressions: Record<string, EnableWhenExpression>,
    questionnaireResponse: QuestionnaireResponse,
    variablesFhirPath: Record<string, Expression[]>
  ) => unknown;
  updateEnableWhenExpressions: (
    questionnaireResponse: QuestionnaireResponse,
    variablesFhirPath: Record<string, Expression[]>
  ) => unknown;
};

export type SourceContextType = {
  source: 'local' | 'remote';
  setSource: (updatedSource: 'local' | 'remote') => unknown;
};

export type DebugModeContextType = {
  debugMode: boolean;
  activateDebugMode: () => unknown;
};

export type RendererContextType = {
  renderer: Renderer;
  setRenderer: (updatedRenderer: Renderer) => unknown;
};

export type CurrentTabIndexContextType = {
  currentTabIndex: number;
  setCurrentTabIndex: (updatedIndex: number) => unknown;
};

export type PrintComponentRefContextType = {
  componentRef: MutableRefObject<null> | null;
  setComponentRef: (componentRef: MutableRefObject<null>) => unknown;
};
