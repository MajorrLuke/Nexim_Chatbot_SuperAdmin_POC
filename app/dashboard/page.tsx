"use client"

import Container from "@/components/Container";
import TituloBody from "@/components/TituloBody";
import { Button, Link, Table } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as Dialog from '@radix-ui/react-dialog';
import ChatWidget from "@/components/dashboard/ChatWidget";

export default function Index() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openWidget, setOpenWidget] = useState(false);
  const [flowId, setFlowId] = useState('');

  const handleDelete = async (flowId: string) => {
    // if (confirm("Tem certeza que deseja excluir este fluxo?")) {
    //   try {
    //     const response = await fetch(`${apiBaseUrl}/api/flows/delete/${flowId}`, {
    //       method: 'DELETE',
    //     });
    //     if (response.ok) {
    //       setFlows(flows.filter(flow => flow._id.toString() !== flowId));
    //     } else {
    //       throw new Error('Falha ao excluir o fluxo');
    //     }
    //   } catch (error) {
    //     console.error('Erro ao excluir o fluxo:', error);
    //     alert('Ocorreu um erro ao excluir o fluxo. Por favor, tente novamente.');
    //   }
    // }
    console.log(flowId)
  };

  useEffect(() => {
    const fetchFlows = async () => {
      const flows = await fetch(`${apiBaseUrl}/api/flows/fetch`).then(res => res.json())
      setFlows(flows);
      setLoading(false);
    }
    fetchFlows();
  }, []);

  const handleWidget = (flowId: string) => {
    setOpenWidget(true)
    setFlowId(flowId)
  }

  return (
    <Container>
      <TituloBody text="Fluxos" />
      {loading ? (
        <p>Carregando...</p>
      ) : flows.length === 0 ? (
        <p>Nenhum fluxo encontrado.</p>
      ) : (
        <Table.Root variant="surface" layout="fixed">
          <Table.Header>
            <Table.Row align="center">
              <Table.ColumnHeaderCell justify="center">Nome</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell justify="center">Ações</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {flows.map((flow: { _id: { toString: () => string }, name: string }) => (
              <Table.Row key={flow._id.toString()}>
                <Table.RowHeaderCell justify="center">{flow.name}</Table.RowHeaderCell>
                <Table.Cell justify="center" className="space-x-2">
                  <Button
                    variant="surface"
                    color="blue"
                    size="1"
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/editor/${flow._id.toString()}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="surface"
                    color="green"
                    size="1"
                    className="cursor-pointer"
                    // onClick={() => router.push(`/playground/chatbot/widget/${flow._id.toString()}`)}
                    onClick={() => handleWidget(flow._id.toString())}
                  >
                    Testar
                  </Button>
                  <Button
                    variant="surface"
                    size="1"
                    color="red"
                    className="cursor-pointer"
                    onClick={() => handleDelete(flow._id.toString())}
                  >
                    Excluir
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {openWidget && (
        <Dialog.Root open={openWidget} onOpenChange={setOpenWidget}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900/80 backdrop-blur-md p-6 rounded-lg shadow-lg border border-zinc-800">
            <ChatWidget flowId={flowId} />
          </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}

    </Container>
  )
}