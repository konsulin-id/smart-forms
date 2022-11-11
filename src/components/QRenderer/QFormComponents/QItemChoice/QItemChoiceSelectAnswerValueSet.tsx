import React from 'react';
import { Autocomplete, FormControl, Grid, TextField, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { Coding, QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import useValueSetOptions from '../../../../custom-hooks/useValueSetOptions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerValueSet(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : createQrItem(qItem);

  let valueCoding: Coding | undefined;
  if (qrChoiceSelect['answer']) {
    valueCoding = qrChoiceSelect['answer'][0].valueCoding;
  }

  const [options] = useValueSetOptions(qItem);

  function handleChange(event: any, newValue: Coding | null) {
    if (newValue) {
      onQrItemChange({
        ...qrChoiceSelect,
        answer: [{ valueCoding: newValue }]
      });
      return;
    }
    onQrItemChange(createQrItem(qItem));
  }

  const choiceSelectAnswerValueSet = (
    <Autocomplete
      id={qItem.id}
      options={options}
      getOptionLabel={(option) => `${option.display}`}
      value={valueCoding ?? null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} sx={{ ...(repeats && { mb: 0 }) }} />}
    />
  );

  const renderQItemChoiceSelectAnswerValueSet = repeats ? (
    <>{choiceSelectAnswerValueSet}</>
  ) : (
    <FormControl>
      <Grid container columnSpacing={6}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          {choiceSelectAnswerValueSet}
        </Grid>
      </Grid>
    </FormControl>
  );
  return <>{renderQItemChoiceSelectAnswerValueSet}</>;
}

export default QItemChoiceSelectAnswerValueSet;