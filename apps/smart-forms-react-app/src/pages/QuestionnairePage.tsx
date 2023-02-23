import React, { useContext, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  Container,
  FormControlLabel,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import Scrollbar from '../components/Scrollbar/Scrollbar';
import QuestionnaireListHead from '../components/Questionnaires/QuestionnaireListHead';
import QuestionnaireListToolbar from '../components/Questionnaires/QuestionnaireListToolbar';
import { QuestionnaireListItem, TableAttributes } from '../interfaces/Interfaces';
import {
  applySortFilter,
  getBundlePromise,
  getComparator,
  getQuestionnaireListItems
} from '../functions/DashboardFunctions';
import QuestionnaireLabel from '../components/Label/QuestionnaireLabel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useQuery } from '@tanstack/react-query';
import { Bundle, Questionnaire } from 'fhir/r5';
import useDebounce from '../custom-hooks/useDebounce';
import QuestionnaireListFeedback from '../components/Questionnaires/QuestionnaireListFeedback';
import CreateNewResponseButton from '../components/Questionnaires/CreateNewResponseButton';
import { SourceContext } from '../layouts/dashboard/DashboardLayout';
import {
  getLocalQuestionnaireBundle,
  loadQuestionnairesFromLocal
} from '../functions/LoadServerResourceFunctions';
import ViewExistingResponsesButton from '../components/Questionnaires/ViewExistingResponsesButton';
import { SelectedQuestionnaireContext } from '../custom-contexts/SelectedQuestionnaireContext';
import { LaunchContext } from '../custom-contexts/LaunchContext';

const TABLE_HEAD: TableAttributes[] = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'publisher', label: 'Publisher', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false }
];

function QuestionnairePage() {
  const { source, setSource } = useContext(SourceContext);
  const { fhirClient } = useContext(LaunchContext);
  const { selectedQuestionnaire, setSelectedQuestionnaire } = useContext(
    SelectedQuestionnaireContext
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<keyof QuestionnaireListItem>('title');

  // search questionnaires
  const [searchInput, setSearchInput] = useState('');
  const debouncedInput = useDebounce(searchInput, 500);
  const numOfSearchEntries = 15;

  const endpointUrl =
    'http://csiro-csiro-14iep6fgtigke-1594922365.ap-southeast-2.elb.amazonaws.com/fhir';
  const queryUrl = `/Questionnaire?_count=${numOfSearchEntries}&title:contains=${debouncedInput}`;

  const localQuestionnaireBundle: Bundle = useMemo(
    () => getLocalQuestionnaireBundle(loadQuestionnairesFromLocal()),
    []
  );

  const { data, status, error } = useQuery<Bundle>(
    ['questionnaires', queryUrl],
    () => getBundlePromise(endpointUrl, queryUrl),
    {
      enabled: debouncedInput === searchInput
    }
  );

  // construct questionnaire list items for data display
  const questionnaireListItems: QuestionnaireListItem[] = useMemo(
    () => getQuestionnaireListItems(source === 'remote' ? data : localQuestionnaireBundle),
    [data, localQuestionnaireBundle, source]
  );

  const emptyRows: number = useMemo(
    () => (page > 0 ? Math.max(0, (1 + page) * rowsPerPage - questionnaireListItems.length) : 0),
    [page, questionnaireListItems.length, rowsPerPage]
  );

  // construct questionnaire list items for data display
  const sortedListItems: QuestionnaireListItem[] = useMemo(
    () =>
      applySortFilter(
        questionnaireListItems,
        getComparator(order, orderBy, 'questionnaire'),
        debouncedInput
      ) as QuestionnaireListItem[],
    [debouncedInput, order, orderBy, questionnaireListItems]
  );

  const isNotFound = sortedListItems.length === 0 && !!debouncedInput;

  // Event handlers
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof QuestionnaireListItem
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (id: string) => {
    const selectedItem = sortedListItems.find((item) => item.id === id);

    if (selectedItem) {
      if (selectedItem.id === selectedQuestionnaire?.listItem.id) {
        setSelectedQuestionnaire(null);
      } else {
        const bundle = source === 'remote' ? data : localQuestionnaireBundle;
        const resource = bundle?.entry?.find((entry) => entry.resource?.id === id)?.resource;

        if (resource) {
          setSelectedQuestionnaire({
            listItem: selectedItem,
            resource: resource as Questionnaire
          });
        } else {
          setSelectedQuestionnaire(null);
        }
      }
    }
  };

  return (
    <Container>
      <Stack direction="row" alignItems="center" mb={5}>
        <Typography variant="h3" gutterBottom>
          Questionnaires
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <FormControlLabel
          control={
            <Switch
              checked={source === 'remote'}
              onChange={() => {
                setSource(source === 'local' ? 'remote' : 'local');
                setSelectedQuestionnaire(null);
                setPage(0);
              }}
            />
          }
          label={
            <Typography variant="subtitle2" textTransform="capitalize">
              {source}
            </Typography>
          }
        />
      </Stack>

      <Card>
        <QuestionnaireListToolbar
          selected={selectedQuestionnaire?.listItem}
          searchInput={searchInput}
          clearSelection={() => setSelectedQuestionnaire(null)}
          onSearch={(input) => {
            setPage(0);
            setSearchInput(input);
          }}
        />

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <QuestionnaireListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                onRequestSort={handleRequestSort}
              />
              <TableBody>
                {sortedListItems
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const { id, title, avatarColor, publisher, date, status } = row;
                    const isSelected = selectedQuestionnaire?.listItem.title === title;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        selected={isSelected}
                        onClick={() => handleRowClick(row.id)}>
                        <TableCell padding="checkbox">
                          <Avatar
                            sx={{
                              bgcolor: avatarColor,
                              ml: 1,
                              my: 2.25,
                              width: 36,
                              height: 36
                            }}>
                            <AssignmentIcon />
                          </Avatar>
                        </TableCell>

                        <TableCell scope="row" sx={{ maxWidth: 240 }}>
                          <Typography variant="subtitle2" sx={{ textTransform: 'Capitalize' }}>
                            {title}
                          </Typography>
                        </TableCell>

                        <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                          {publisher}
                        </TableCell>

                        <TableCell align="left" sx={{ textTransform: 'Capitalize' }}>
                          {date}
                        </TableCell>

                        <TableCell align="left">
                          <QuestionnaireLabel color={status}>{status}</QuestionnaireLabel>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>

              {isNotFound || status === 'error' ? (
                <QuestionnaireListFeedback
                  status={status}
                  searchInput={searchInput}
                  error={error}
                />
              ) : null}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sortedListItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value));
            setPage(0);
          }}
        />
      </Card>

      <Stack direction="row-reverse" alignItems="center" gap={2} my={5}>
        {fhirClient ? <ViewExistingResponsesButton /> : null}
        <CreateNewResponseButton selectedQuestionnaire={selectedQuestionnaire} source={source} />
      </Stack>
    </Container>
  );
}

export default QuestionnairePage;
