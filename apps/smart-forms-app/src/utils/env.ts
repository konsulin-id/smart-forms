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
export const FORMS_SERVER_ENDPOINT =
  import.meta.env.VITE_FORMS_SERVER_URL ?? 'https://api.smartforms.io/fhir';
export const ONTOSERVER_ENDPOINT =
  import.meta.env.VITE_ONTOSERVER_URL ?? 'https://tx.ontoserver.csiro.au/fhir/';

export const SHOW_DEBUG_MODE = import.meta.env.VITE_SHOW_DEBUG_MODE ?? 'false';