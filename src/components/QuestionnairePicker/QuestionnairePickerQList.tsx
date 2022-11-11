import { Questionnaire } from 'fhir/r5';
import React from 'react';
import {
  Box,
  Card,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

interface Props {
  qHostingIsLocal: boolean;
  questionnaires: Questionnaire[];
  searchInput: string;
  selectedIndex: number | null;
  qIsSearching: boolean;
  onQSelectedIndexChange: (index: number) => unknown;
}

function QuestionnairePickerQList(props: Props) {
  const {
    qHostingIsLocal,
    questionnaires,
    searchInput,
    selectedIndex,
    qIsSearching,
    onQSelectedIndexChange
  } = props;

  if (!qHostingIsLocal && searchInput === '') {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Typography variant="subtitle2" textAlign="center">
          Enter a questionnaire title in the search bar above to load results.
        </Typography>
      </Card>
    );
  } else if (qIsSearching) {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Stack direction="row">
            <Typography variant="subtitle2">Loading search results</Typography>
            <CircularProgress size={20} sx={{ ml: 1 }} />
          </Stack>
        </Box>
      </Card>
    );
  } else if (questionnaires.length === 0) {
    return (
      <Card elevation={2} sx={{ m: 2, p: 2, borderRadius: 25 }}>
        <Typography variant="subtitle2" textAlign="center">
          {`We didn't manage to find anything from the search terms - ${searchInput}.`}
        </Typography>
        <Typography variant="subtitle2" textAlign="center">
          Try searching for something else.
        </Typography>
      </Card>
    );
  } else {
    return (
      <List sx={{ width: '100%', overflow: 'auto', py: 0 }}>
        {questionnaires.map((questionnaire, i) => (
          <React.Fragment key={questionnaire.id}>
            <ListItemButton
              selected={selectedIndex === i}
              sx={{ py: 1.25, px: 2.5 }}
              onClick={() => {
                onQSelectedIndexChange(i);
              }}>
              <ListItemText
                primary={`${questionnaire.title}`}
                primaryTypographyProps={{ variant: 'subtitle2' }}
              />
            </ListItemButton>
            <Divider light />
          </React.Fragment>
        ))}
      </List>
    );
  }
}

export default QuestionnairePickerQList;