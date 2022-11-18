import React, { useContext, useEffect } from 'react';
import { FormControl, Grid, TextField, Typography } from '@mui/material';

import {
  PropsWithQrItemChangeHandler,
  PropsWithRepeatsAttribute
} from '../../../../interfaces/Interfaces';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { createQrItem } from '../../../../functions/QrItemFunctions';
import { CalcExpressionContext } from '../../Form';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemQuantity(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;
  const calculatedExpressions = useContext(CalcExpressionContext);

  let qrQuantity = qrItem ? qrItem : createQrItem(qItem);
  let valueQuantity: number | undefined = 0.0;
  let unitQuantity: string | undefined = '';

  if (qrQuantity['answer']) {
    const answer = qrQuantity['answer'][0];
    valueQuantity = answer.valueQuantity ? answer.valueQuantity.value : 0.0;
    unitQuantity = answer.valueQuantity ? answer.valueQuantity.unit : '';
  }

  useEffect(() => {
    const expression = calculatedExpressions[qItem.linkId];

    if (expression && expression.value) {
      qrQuantity = {
        ...qrQuantity,
        answer: [{ valueQuantity: { value: expression.value, unit: unitQuantity } }]
      };
      onQrItemChange(qrQuantity);
    }
  }, [calculatedExpressions]);

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    let input = event.target.value;

    const hasNumber = /\d/;
    if (!hasNumber.test(input)) {
      input = '0';
    }
    qrQuantity = {
      ...qrQuantity,
      answer: [{ valueQuantity: { value: parseFloat(input), unit: unitQuantity } }]
    };
    onQrItemChange(qrQuantity);
  }

  function handleUnitChange(event: React.ChangeEvent<HTMLInputElement>) {
    onQrItemChange({
      ...qrQuantity,
      answer: [{ valueQuantity: { value: valueQuantity, unit: event.target.value } }]
    });
  }

  const QItemQuantityFields = (
    <Grid container columnSpacing={1}>
      <Grid item xs={6}>
        <TextField
          type="number"
          id={qItem.linkId}
          value={valueQuantity}
          onChange={handleValueChange}
        />
      </Grid>

      <Grid item xs={6}>
        <TextField id={qItem.linkId + '_unit'} value={unitQuantity} onChange={handleUnitChange} />
      </Grid>
    </Grid>
  );

  if (repeats) {
    return <>{QItemQuantityFields}</>;
  } else {
    return (
      <FormControl>
        <Grid container columnSpacing={6}>
          <Grid item xs={5}>
            <Typography>{qItem.text}</Typography>
          </Grid>
          <Grid item xs={7}>
            {QItemQuantityFields}
          </Grid>
        </Grid>
      </FormControl>
    );
  }
}

export default QItemQuantity;