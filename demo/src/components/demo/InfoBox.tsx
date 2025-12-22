"use client"
import React, { memo } from "react";
import { ListCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type InfoBoxIcon =
  | React.ReactElement<IconProps>
  | React.ComponentType<IconProps>;

type InfoBoxProps = {
  title: string;
  items: string[];
  icon?: InfoBoxIcon;
  accentColor?: string;
};

type IconProps = {
  className?: string;
  color?: string;
};

export function InfoBox({
  title,
  items,
  icon,
  accentColor = "#008cd2",
}: InfoBoxProps) {
  return (
    <Card
      className="w-full h-full flex flex-col p-0 m-0 gap-0 px-[25px] rounded-[20px] shadow-[0px_4px_20px_0px_#EEEEEE80] ppt-group-root"
      style={{ border: "1px solid #F8F9FA" }}
    >
      <CardHeader className="w-full h-[32px] p-0 m-0 mt-[17px]">
        <div className="w-full text-h2 font-semibold flex items-center justify-start gap-[8px]" style={{ color: "#05004E" }}>
          {(() => {
            const className = 'w-[19px] h-[25px] m-0 p-0 pdfppt-noprint';

            if (React.isValidElement<IconProps>(icon)) {
              return React.cloneElement(icon, { className, color: accentColor });
            }

            if (typeof icon === 'function' || typeof icon === 'object') {
              const IconComp = icon;
              return <IconComp className={className} color={accentColor} />;
            }

            return <ListCheck className={className} color={accentColor} />;
          })()}
          {title}
        </div>
      </CardHeader>

      <CardContent
        className="w-full mt-[27px] mb-[25px] p-0 flex flex-col gap-0 no-scrollbar">

        <div className="w-full flex flex-col gap-y-[23px]">
          {items.map((text, idx) => {
            return (
              <div key={idx} className="w-full flex flex-col gap-0">
                <div
                  key={idx}
                  className="w-full min-h-[92px] py-[18px] pl-[15px] pr-[31px] rounded-r-[7px] border-1 font-normal text-filter-size bg-white flex items-center"
                  style={{ borderColor: '#E5E5E5', borderLeftWidth: '5px', borderLeftColor: accentColor, color: '#323030' }}
                >
                  {text}
                </div>
              </div>
            );

          })}
        </div>
      </CardContent>

    </Card>
  );
}

export default memo(InfoBox);