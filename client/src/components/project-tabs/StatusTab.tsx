import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Pagination,
  IconButton,
  Chip,
  Stack,
  Link
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useDropzone } from 'react-dropzone';
import { Project, StatusMessage, Attachment } from '../../types/project';
import { statusApi } from '../../utils/api';
import { useAppSelector } from '../../app/store';

interface StatusTabProps {
  project: Project;
}

const StatusTab: React.FC<StatusTabProps> = ({ project }) => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Функция для загрузки сообщений о статусе
  const fetchStatusMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await statusApi.getProjectStatusMessages(project._id, page, 5);
      setStatusMessages(response.statusMessages);
      setTotalPages(response.pages);
      setLoading(false);
    } catch (err) {
      setError('Ошибка при загрузке сообщений о статусе');
      setLoading(false);
      console.error('Error fetching status messages:', err);
    }
  }, [project._id, page]);

  // Загрузка сообщений при монтировании компонента и изменении страницы
  useEffect(() => {
    fetchStatusMessages();
  }, [fetchStatusMessages, page]);

  // Настройка Dropzone для загрузки файлов
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Ограничение на количество файлов (максимум 5)
    const newFiles = [...files, ...acceptedFiles].slice(0, 5);
    setFiles(newFiles);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
      'text/plain': []
    },
    maxSize: 10 * 1024 * 1024 // 10 МБ
  });

  // Удаление файла из списка
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  // Отправка сообщения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Пожалуйста, введите текст сообщения');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Создание сообщения
      const newMessage = await statusApi.createStatusMessage(project._id, message);
      
      // Если есть файлы, загружаем их
      if (files.length > 0) {
        await statusApi.uploadAttachments(newMessage._id, files);
      }
      
      // Очистка формы
      setMessage('');
      setFiles([]);
      setSuccessMessage('Сообщение успешно отправлено');
      
      // Обновление списка сообщений
      fetchStatusMessages();
      
      // Скрытие сообщения об успехе через 3 секунды
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Ошибка при отправке сообщения');
      console.error('Error sending message:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Обработка изменения страницы
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Получение типа файла для отображения иконки
  const getFileTypeIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) {
      return '🖼️';
    } else if (mimetype.includes('pdf')) {
      return '📄';
    } else if (mimetype.includes('word')) {
      return '📝';
    } else if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) {
      return '📊';
    } else {
      return '📎';
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Статусы проекта
        </Typography>
        
        {/* Форма для добавления нового сообщения */}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Добавить новое сообщение
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Введите текст сообщения..."
            sx={{ mb: 2 }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={submitting}
          />
          
          {/* Dropzone для загрузки файлов */}
          <Box 
            {...getRootProps()} 
            sx={{ 
              border: '2px dashed #cccccc', 
              borderRadius: 1, 
              p: 2, 
              mb: 2,
              backgroundColor: isDragActive ? '#f0f8ff' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <input {...getInputProps()} />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AttachFileIcon sx={{ mr: 1 }} />
              {isDragActive ? (
                <Typography>Перетащите файлы сюда...</Typography>
              ) : (
                <Typography>
                  Перетащите файлы сюда или нажмите для выбора файлов (макс. 5 файлов, до 10 МБ каждый)
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Список выбранных файлов */}
          {files.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Выбранные файлы:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeFile(index)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={submitting}
            >
              {submitting ? 'Отправка...' : 'Отправить'}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        {/* Лента сообщений */}
        <Typography variant="subtitle1" gutterBottom>
          История сообщений
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : statusMessages.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Нет сообщений о статусе для этого проекта
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            {statusMessages.map((statusMessage) => (
              <Card key={statusMessage._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" color="primary">
                        {statusMessage.userName} ({statusMessage.userRole})
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        {formatDate(statusMessage.createdAt)}
                      </Typography>
                    </Box>
                    
                    {/* Кнопка удаления сообщения (только для автора или менеджера) */}
                    {(user?._id === statusMessage.userId || user?.role === 'manager') && (
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={async () => {
                          if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
                            try {
                              await statusApi.deleteStatusMessage(statusMessage._id);
                              fetchStatusMessages();
                            } catch (err) {
                              setError('Ошибка при удалении сообщения');
                              console.error('Error deleting message:', err);
                            }
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                    {statusMessage.message}
                  </Typography>
                  
                  {/* Вложения */}
                  {statusMessage.attachments && statusMessage.attachments.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Вложения:
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {statusMessage.attachments.map((attachment) => (
                          <Box 
                            key={attachment._id}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1,
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: '#f5f5f5'
                            }}
                          >
                            <Typography variant="body2" sx={{ mr: 1 }}>
                              {getFileTypeIcon(attachment.fileType)} {attachment.fileName}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <Link 
                              href={attachment.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center' }}
                            >
                              <DownloadIcon fontSize="small" />
                            </Link>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Пагинация */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default StatusTab;