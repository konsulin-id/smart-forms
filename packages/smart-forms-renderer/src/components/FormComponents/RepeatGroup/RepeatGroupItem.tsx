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

import React from 'react';
import { RepeatGroupContainerStack } from '../RepeatItem/RepeatItem.styles';
import Box from '@mui/material/Box';
import GroupItem from '../GroupItem/GroupItem';
import type {
  PropsWithParentIsReadOnlyAttribute,
  PropsWithQrItemChangeHandler
} from '../../../interfaces/renderProps.interface';
import type { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r4';
import DeleteItemButton from './DeleteItemButton';

interface RepeatGroupItemProps
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  answeredQrItem: QuestionnaireResponseItem;
  nullableQrItem: QuestionnaireResponseItem | null;
  numOfRepeatGroups: number;
  groupCardElevation: number;
  onDeleteItem: () => void;
}

function RepeatGroupItem(props: RepeatGroupItemProps) {
  const {
    qItem,
    answeredQrItem,
    nullableQrItem,
    numOfRepeatGroups,
    groupCardElevation,
    parentIsReadOnly,
    onDeleteItem,
    onQrItemChange
  } = props;

  return (
    <RepeatGroupContainerStack direction="row" justifyContent="end">
      <Box sx={{ flexGrow: 1 }}>
        <GroupItem
          qItem={qItem}
          qrItem={answeredQrItem}
          isRepeated={true}
          parentIsReadOnly={parentIsReadOnly}
          groupCardElevation={groupCardElevation + 1}
          onQrItemChange={onQrItemChange}
        />
      </Box>
      <DeleteItemButton
        nullableQrItem={nullableQrItem}
        numOfRepeatGroups={numOfRepeatGroups}
        parentIsReadOnly={parentIsReadOnly}
        onDeleteItem={onDeleteItem}
      />
    </RepeatGroupContainerStack>
  );
}

export default RepeatGroupItem;
