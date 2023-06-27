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

import { memo, useState } from 'react';
import { Grid } from '@mui/material';
import { FullWidthFormComponentBox } from '../../../../../../components/Box/Box.styles.tsx';

import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import { createEmptyQrItem } from '../../../../utils/qrItem.ts';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DateField, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import QItemDisplayInstructions from './QItemDisplayInstructions.tsx';
import QItemLabel from '../QItemParts/QItemLabel.tsx';
import useRenderingExtensions from '../../../../hooks/useRenderingExtensions.ts';
import type {
  PropsWithIsRepeatedAttribute,
  PropsWithIsTabledAttribute,
  PropsWithQrItemChangeHandler
} from '../../../../types/renderProps.interface.ts';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithIsRepeatedAttribute,
    PropsWithIsTabledAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemDate(props: Props) {
  const { qItem, qrItem, isRepeated, isTabled, onQrItemChange } = props;

  // Init input value
  const qrDate = qrItem ?? createEmptyQrItem(qItem);
  const answerValue = qrDate.answer ? qrDate.answer[0].valueDate : null;
  const answerValueDayJs = answerValue ? dayjs(answerValue) : null;
  const [value, setValue] = useState<Dayjs | null>(answerValueDayJs);

  // Get additional rendering extensions
  const { displayPrompt, displayInstructions, readOnly, entryFormat } =
    useRenderingExtensions(qItem);

  // Event handlers
  function handleChange(newValue: Dayjs | null | undefined) {
    if (newValue) {
      setValue(newValue);
      onQrItemChange({
        ...createEmptyQrItem(qItem),
        answer: [{ valueDate: newValue.format('YYYY-MM-DD') }]
      });
    } else {
      onQrItemChange(createEmptyQrItem(qItem));
    }
  }

  const renderQItemDate = isRepeated ? (
    <QItemDatePicker
      value={value}
      onDateChange={handleChange}
      isTabled={isTabled}
      displayPrompt={displayPrompt}
      readOnly={readOnly}
      entryFormat={entryFormat}
    />
  ) : (
    <FullWidthFormComponentBox data-test="q-item-date-box">
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <QItemLabel qItem={qItem} />
        </Grid>
        <Grid item xs={7}>
          <QItemDatePicker
            value={value}
            onDateChange={handleChange}
            isTabled={isTabled}
            displayPrompt={displayPrompt}
            readOnly={readOnly}
            entryFormat={entryFormat}
          />
          <QItemDisplayInstructions displayInstructions={displayInstructions} />
        </Grid>
      </Grid>
    </FullWidthFormComponentBox>
  );

  return <>{renderQItemDate}</>;
}

interface QItemDatePickerProps extends PropsWithIsTabledAttribute {
  value: Dayjs | null;
  onDateChange: (newValue: Dayjs | null) => unknown;
  displayPrompt: string;
  readOnly: boolean;
  entryFormat: string;
}

function QItemDatePicker(props: QItemDatePickerProps) {
  const { value, onDateChange, displayPrompt, readOnly, isTabled, entryFormat } = props;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DateField
        format={entryFormat !== '' ? entryFormat : 'DD/MM/YYYY'}
        value={value}
        fullWidth
        disabled={readOnly}
        label={displayPrompt}
        sx={{ maxWidth: !isTabled ? 280 : 3000 }}
        onChange={onDateChange}
        data-test="q-item-date-field"
      />
    </LocalizationProvider>
  );
}

export default memo(QItemDate);