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

import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { RepeatGroupSingle } from '../../../../types/repeatGroup.interface.ts';

interface AddItemButtonProps {
  repeatGroups: RepeatGroupSingle[];
  onAddItem: () => void;
}

function AddItemButton(props: AddItemButtonProps) {
  const { repeatGroups, onAddItem } = props;

  const isDisabled = repeatGroups[repeatGroups.length - 1].qrItem === null;

  return (
    <Box display="flex" flexDirection="row-reverse" marginTop={1}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        disabled={isDisabled}
        onClick={onAddItem}
        data-test="button-add-repeat-item">
        Add Item
      </Button>
    </Box>
  );
}

export default AddItemButton;