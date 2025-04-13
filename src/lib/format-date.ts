// 日付をフォーマットする関数
//*APIレスポンスがJSON形式で送信される際、Date オブジェクトは自動的に文字列に変換されるので、
//*引数がstringの場合も考慮しないとエラーが発生する
export const formatDate = (date: Date | string | number) => {
  // 文字列または数値の場合は Date オブジェクトに変換
  let dateObj: Date;

  try {
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === "string") {
      dateObj = new Date(date);
    } else if (typeof date === "number") {
      dateObj = new Date(date);
    } else {
      console.error("Unsupported date format:", date);
      return "不明な日付";
    }

    // 無効な日付の場合はエラーメッセージを返す
    if (isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return "不明な日付";
    }

    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "不明な日付";
  }
};
