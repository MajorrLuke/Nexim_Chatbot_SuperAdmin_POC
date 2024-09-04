'use client'

import React, { useState, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from 'react-day-picker';
import { Card, Flex, Text, Button } from '@radix-ui/themes';
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import Container from "@/components/Container";
import TituloBody from "@/components/TituloBody";

const reports = [
  { id: 'total-conversations', name: 'Total de conversas' },
];

export default function AnalyticsPage() {
  const [selectedReport, setSelectedReport] = useState(reports[0].id);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7)
  });
  const [conversationCount, setConversationCount] = useState(0);

  useEffect(() => {
    if (date?.from && date?.to) {
      fetchConversationCount(date.from, date.to);
    }
  }, [date]);

  const fetchConversationCount = async (startDate: Date, endDate: Date) => {
    const response = await fetch(`/api/analytics/totalConversations?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    const data = await response.json();
    setConversationCount(data.count);
  };

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    console.log(selectedDate); // Add this for debugging
  };

  return (
    <Container>
      <TituloBody text="Analytics" />
      <Flex gap="4">
        <Card className="w-64 p-4">
          <Text as="p" size="2" weight="bold" mb="2">
            Reports
          </Text>
          {reports.map((report) => (
            <Button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              variant={selectedReport === report.id ? 'solid' : 'ghost'}
              className="w-full justify-start mb-2"
            >
              {report.name}
            </Button>
          ))}
        </Card>
        <Card className="flex-1 p-4">
          <Flex justify="between" align="center" mb="4">
            <Text size="5" weight="bold">
              {reports.find(r => r.id === selectedReport)?.name}
            </Text>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    "text-black dark:text-white",
                    "!border-gray-300",
                    "!ring-1 !ring-gray-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={handleSelect}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </Flex>
          <Text as="p" size="5" weight="bold" mb="4">
            Total Conversations: {conversationCount}
          </Text>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={[{ name: 'Conversations', total: conversationCount }]}>
              <XAxis dataKey="name" />
              <YAxis />
              <Bar dataKey="total" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Flex>
    </Container>
  );
}
