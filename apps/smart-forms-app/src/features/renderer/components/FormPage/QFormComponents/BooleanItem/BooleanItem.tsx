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
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';
import FieldGrid from '../FieldGrid.tsx';
import BooleanField from './BooleanField.tsx';
import useInitialiseBooleanFalse from '../../../../hooks/useInitialiseBooleanFalse.ts';
import { Box } from '@mui/material';

interface BooleanItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function BooleanItem(props: BooleanItemProps) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Get additional rendering extensions
  const { displayInstructions, readOnly } = useRenderingExtensions(qItem);

  // Init input value
  let checked = false;
  if (qrItem?.answer && qrItem.answer[0].valueBoolean) {
    checked = qrItem.answer[0].valueBoolean;
  }

  useInitialiseBooleanFalse(qItem, qrItem, onQrItemChange);

  // Event handlers
  function handleCheckedChange(newChecked: boolean) {
    onQrItemChange({
      ...createEmptyQrItem(qItem),
      answer: [{ valueBoolean: newChecked }]
    });
  }

  if (isTabled) {
    return (
      <Box display="flex" justifyContent="center">
        <BooleanField checked={checked} readOnly={readOnly} onCheckedChange={handleCheckedChange} />
      </Box>
    );
  }

  if (isRepeated) {
    return (
      <BooleanField checked={checked} readOnly={readOnly} onCheckedChange={handleCheckedChange} />
    );
  }
  return (
    <FullWidthFormComponentBox data-test="q-item-boolean-box">
      <FieldGrid qItem={qItem} displayInstructions={displayInstructions}>
        <BooleanField checked={checked} readOnly={readOnly} onCheckedChange={handleCheckedChange} />
      </FieldGrid>
    </FullWidthFormComponentBox>
  );
}

export default BooleanItem;
