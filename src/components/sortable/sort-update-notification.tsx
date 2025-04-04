"use client";

import React from "react";

type Props = {
  isUpdating: boolean;
  updateError: string | null;
};

export default function SortUpdateNotification({
  isUpdating,
  updateError,
}: Props) {
  return (
    <>
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md shadow-md z-50 animate-fade-in">
          順序を保存中...
        </div>
      )}

      {updateError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-md shadow-md z-50 animate-fade-in">
          {updateError}
        </div>
      )}
    </>
  );
}
