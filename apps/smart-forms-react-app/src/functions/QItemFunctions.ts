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

import type { QuestionnaireItem } from 'fhir/r5';
import { hasHiddenExtension } from './ItemControlFunctions';
import { getChoiceControlType } from './ChoiceFunctions';
import { QItemChoiceControl, QItemOpenChoiceControl } from '../interfaces/Enums';
import { getOpenChoiceControlType } from './OpenChoiceFunctions';
import type { EnableWhenContextType } from '../interfaces/ContextTypes';

/**
 * Test the given QItem on a series of checks to verify if the item should be displayed
 * Check if qItem has hidden attribute
 * Check if qItem fufilled its enableWhen criteria
 *
 * @author Sean Fong
 */
export function isHidden(
  qItem: QuestionnaireItem,
  enableWhenContext: EnableWhenContextType
): boolean {
  if (hasHiddenExtension(qItem)) return true;

  if (enableWhenContext.isActivated && enableWhenContext.items[qItem.linkId]) {
    return !enableWhenContext.items[qItem.linkId].isEnabled;
  }

  return false;
}

/**
 * Check if qItem is a repeat item AND if it isn't a checkbox item
 * Note: repeat checkbox items are rendered as multi-select checkbox instead of being rendered as a traditional repeat item
 *
 * @author Sean Fong
 */
export function isRepeatItemAndNotCheckbox(qItem: QuestionnaireItem): boolean {
  const isCheckbox =
    getChoiceControlType(qItem) === QItemChoiceControl.Checkbox ||
    getOpenChoiceControlType(qItem) === QItemOpenChoiceControl.Checkbox;

  return !!qItem['repeats'] && !isCheckbox;
}
