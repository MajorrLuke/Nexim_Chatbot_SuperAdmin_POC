'use client'
import { useState, useEffect, useRef } from 'react';
import { File as CustomFile } from '@/app/definitions/floweditor/definitions';
import { FaTrash } from 'react-icons/fa';
import * as Dialog from '@radix-ui/react-dialog';
import { Card, DataList, Badge, Code, Flex, IconButton, Button, Spinner, Progress } from '@radix-ui/themes';
import { CopyIcon, UploadIcon } from '@radix-ui/react-icons';
import Container from '@/components/Container';
import TituloBody from '@/components/TituloBody';

export default function RAGPage() {
  const [files, setFiles] = useState<CustomFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CustomFile | File | null>(null);
  const [fileToDelete, setFileToDelete] = useState<CustomFile | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchFiles = async () => {
    setIsLoading(true);
    const response = await fetch(`${apiBaseUrl}/api/rag/fetch`);
    if (response.ok) {
      const fetchedFiles = await response.json();
      setFiles(fetchedFiles);
    } else {
      console.error('Failed to fetch files');
    }
    setIsLoading(false);
  };

  const deleteFile = async (id: string) => {
    const response = await fetch(`${apiBaseUrl}/api/rag/delete?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      fetchFiles();
    } else {
      console.error('Failed to delete file');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file as File);
      setIsDialogOpen(true);
    }
    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  const confirmUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setIsDialogOpen(false);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile as Blob);

    try {
      const response = await fetch(`${apiBaseUrl}/api/rag/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        // Simulate progress for demonstration
        for (let i = 0; i <= 100; i += 10) {
          setUploadProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        await fetchFiles();
      } else {
        console.error('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
    }
  };

  const handleDeleteClick = (file: CustomFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    await deleteFile(fileToDelete._id.toString());
    setIsDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  return (
    <Container>
      <div className="flex justify-between items-center mb-4">
        <TituloBody text="Documentos RAG" />
        <div className='flex flex-col gap-2'>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className={`hidden ${isUploading ? 'cursor-not-allowed' : ''}`}
            accept=".csv,.docx,.epub,.hwp,.ipynb,.jpeg,.jpg,.mbox,.md,.mp3,.mp4,.pdf,.png,.ppt,.pptm,.pptx,.txt"
            disabled={isUploading}
          />
          <Button
            className='px-4 py-2 rounded-md text-black cursor-pointer bg-[#0affed]'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Spinner /> Enviando...
              </>
            ) : (
              <>
                <UploadIcon /> Upload
              </>
            )}
          </Button>
          {isUploading && (
            <Progress 
              value={uploadProgress} 
              size="1"
              color="yellow"
            />
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Spinner size="3" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file._id.toString()} className="p-4">
              <DataList.Item className="w-full">
                <Flex justify="end" className='w-1/6 absolute top-0 right-0 p-2 '>
                  <IconButton
                    onClick={() => handleDeleteClick(file)}
                    color="red"
                    variant="soft"
                    aria-label="Delete file"
                    className='w-6 h-6 p-1.5 cursor-pointer'
                  >
                    <FaTrash />
                  </IconButton>
                </Flex>
                <Flex className='mt-6' direction="column" gap="2">
                  <Flex align="center" justify="between">
                    <DataList.Label className='w-1/2'>Filename</DataList.Label>
                    <DataList.Value className='w-1/2'>
                      <Flex align="center" gap="2">
                        <Code variant="ghost">{file.filename}</Code>
                        <IconButton
                          size="1"
                          aria-label="Copy filename"
                          color="gray"
                          variant="ghost"
                        >
                          <CopyIcon />
                        </IconButton>
                      </Flex>
                    </DataList.Value>
                  </Flex>
                  <Flex align="center" justify="between">
                    <DataList.Label className='w-1/2'>Status</DataList.Label>
                    <DataList.Value className='w-1/2'>
                      <Badge
                        color={
                          file.status === 'pending' ? 'yellow' :
                            file.status === 'indexed' ? 'green' :
                              file.status === 'failed' ? 'red' :
                                'jade'
                        }
                        variant="soft"
                        radius="full"
                      >
                        {file.status}
                      </Badge>
                    </DataList.Value>
                  </Flex>
                  <Flex align="center" justify="between">
                    <DataList.Label className='w-1/2'>Upload Date</DataList.Label>
                    <DataList.Value className='w-1/2'>{new Date(file.uploadDate).toISOString().split('T')[0].replace(/-/g, '/')}</DataList.Value>
                  </Flex>
                  <Flex className='mb-6' align="center" justify="between">
                    <DataList.Label className='w-1/2'>File Type</DataList.Label>
                    <DataList.Value className='w-1/2'><Badge className="text-black bg-[#0affed]/80">{file.fileType}</Badge></DataList.Value>
                  </Flex>

                </Flex>
              </DataList.Item>
            </Card>
          ))}
        </div>
      )}

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-zinc-800">
            <Dialog.Title className="text-lg font-bold mb-2 text-white">Confirmar Upload</Dialog.Title>
            <Dialog.Description className="mb-4 text-white text-sm">
              Tem certeza que deseja fazer o upload de {(selectedFile as File)?.name || (selectedFile as CustomFile)?.filename}?
            </Dialog.Description>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="surface"
                color="gray"
                className='p-2 rounded-md'
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmUpload}
                variant="surface"
                color="blue"
                className='p-2 rounded-md'
              >
                Upload
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-zinc-800">
            <Dialog.Title className="text-lg font-bold mb-2 text-white">Confirmar Exclusão</Dialog.Title>
            <Dialog.Description className="mb-4 text-white text-sm">
              Tem certeza que deseja excluir {fileToDelete?.filename}?
            </Dialog.Description>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="surface"
                color="gray"
                className='p-2 rounded-md'
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmDelete}
                variant="surface"
                color="red"
                className='p-2 rounded-md'
              >
                Excluir
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Container>
  );
}