"use client";

import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

interface BreadcrumbNavigationProps {
  path: string;
  onNavigate: (newPath: string) => void;
}

export default function BreadcrumbNavigation({
  path,
  onNavigate,
}: BreadcrumbNavigationProps) {
  const parts = path === "/" ? [] : path.split("/").filter(Boolean);
  const fullPaths = parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"));

  // Show ellipsis if more than 3 parts after root
  const shouldShowEllipsis = parts.length > 3;

  const renderBreadcrumbItems = () => {
    if (parts.length === 0) {
      // At root directory
      return (
        <>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>root</BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }

    if (!shouldShowEllipsis) {
      // Show all parts normally
      return parts.map((part, i) => {
        const isLast = i === parts.length - 1;
        return (
          <div key={fullPaths[i]} className="flex items-center">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage>{part}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink onClick={() => onNavigate(fullPaths[i])}>
                  {part}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        );
      });
    } else {
      // Show first part, ellipsis, then last two parts
      return (
        <>
          {/* First part */}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate(fullPaths[0])}>
              {parts[0]}
            </BreadcrumbLink>
          </BreadcrumbItem>

          {/* Ellipsis */}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>

          {/* Last two parts */}
          {parts.slice(-2).map((part, i) => {
            const actualIndex = parts.length - 2 + i;
            const isLast = i === 1; // Last of the two parts
            return (
              <div key={fullPaths[actualIndex]} className="flex items-center">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{part}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink onClick={() => onNavigate(fullPaths[actualIndex])}>
                      {part}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            );
          })}
        </>
      );
    }
  };

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {/* Root directory */}
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => onNavigate("/")}>
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {renderBreadcrumbItems()}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
