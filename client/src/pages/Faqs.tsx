import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Search, Filter,CircleArrowDown } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function Faqs() {

  const { t, i18n } = useTranslation();
  const { data: artists = [],isLoading } = useQuery({
    queryKey: ["/api/artists"],
  });

  const faqsLeft = [
      {question : t("faqsListQuestionOne"),answer : t("faqsListAnswerOne")},
      {question : t("faqsListQuestionTwo"),answer : t("faqsListAnswerTwo")},
      {question : t("faqsListQuestionThree"),answer : t("faqsListAnswerThree")},
      {question : t("faqsListQuestionFour"),answer : t("faqsListAnswerFour")},
      {question : t("faqsListQuestionFive"),answer : t("faqsListAnswerFive")},
  ]

  const faqsRight = [
      {question : t("faqsListQuestionSix"),answer : t("faqsListAnswerSix")},
      {question : t("faqsListQuestionSeven"),answer : t("faqsListAnswerSeven")},
      {question : t("faqsListQuestionEight"),answer : t("faqsListAnswerEight")},
      {question : t("faqsListQuestionNine"),answer : t("faqsListAnswerNine")},
      {question : t("faqsListQuestionTen"),answer : t("faqsListAnswerTen")},
  ]

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-16 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("faqsMainTitle")}</h1>
        <p className="text-lg text-gray-600">
          {t("faqsMainDesc")}
        </p>
      </div>
    </div>
    
       {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t("faqsListTitle")}</h2>
            {/* <p className="text-xl text-gray-600">From design to delivery in 4 simple steps</p> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 animate-stagger">

              <div className="max-h-full px-8 space-y-4">

                {faqsLeft.map((faq) => (
                    <Collapsible className="border px-4 py-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        {faq.question}
                        <CircleArrowDown />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t mt-4 pt-3">
                        {faq.answer}
                      </CollapsibleContent>
                    </Collapsible>
                ))}

              </div>

              <div className="space-y-4">
                {faqsRight.map((faq) => (
                    <Collapsible className="border px-4 py-4">
                      <CollapsibleTrigger className="flex items-center justify-between w-full">
                        {faq.question}
                        <CircleArrowDown  />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="border-t mt-4 pt-3">
                        {faq.answer}
                      </CollapsibleContent>
                    </Collapsible>
                ))}
              </div>

          </div>
        </div>
      </section>  

    </>
  );
}
