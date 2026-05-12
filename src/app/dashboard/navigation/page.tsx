"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface NavItem {
  id: string;
  label: string;
  url: string;
  visible: boolean;
}

function SortableNavItem({ item, onRemove }: { item: NavItem; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-4 p-3 bg-white border border-[var(--color-border-default)] rounded-md mb-2 ${isDragging ? 'shadow-md opacity-80' : ''}`}
    >
      <button 
        className="cursor-grab active:cursor-grabbing p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        {...attributes} 
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-1 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-4">
          <Input defaultValue={item.label} className="h-8 text-sm" />
        </div>
        <div className="col-span-5">
          <Input defaultValue={item.url} className="h-8 text-sm text-[var(--color-text-muted)] font-mono" />
        </div>
        <div className="col-span-2 flex items-center justify-center">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" className="sr-only" defaultChecked={item.visible} />
              <div className={`block w-10 h-6 rounded-full ${item.visible ? 'bg-[var(--color-primary)]' : 'bg-stone-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${item.visible ? 'transform translate-x-4' : ''}`}></div>
            </div>
          </label>
        </div>
        <div className="col-span-1 flex justify-end">
          <button 
            onClick={() => onRemove(item.id)}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  const [items, setItems] = useState<NavItem[]>([
    { id: '1', label: 'Home', url: '/', visible: true },
    { id: '2', label: 'About Us', url: '/about', visible: true },
    { id: '3', label: 'What We Do', url: '/what-we-do', visible: true },
    { id: '4', label: 'News', url: '/news', visible: true },
    { id: '5', label: 'Contact', url: '/contact', visible: false },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <>
      <Topbar 
        title="Navigation Manager" 
        actions={
          <Button variant="primary" className="h-9">
            Save Changes
          </Button>
        } 
      />
      <div className="mt-2 w-full max-w-4xl sm:mt-3">
        <Card className="p-0 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-[var(--color-border-default)] bg-stone-50 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            <div className="col-span-1 pl-8">Order</div>
            <div className="col-span-4">Label</div>
            <div className="col-span-4">URL Path</div>
            <div className="col-span-2 text-center">Visible</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>
          
          <div className="p-4 bg-[var(--color-page-bg)]">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map(item => (
                  <SortableNavItem key={item.id} item={item} onRemove={handleRemove} />
                ))}
              </SortableContext>
            </DndContext>
            
            {/* Add new row */}
            <div className="flex items-center gap-4 p-3 bg-stone-50 border border-dashed border-stone-300 rounded-md mt-4">
              <div className="w-8"></div>
              <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4">
                  <Input placeholder="New link label..." className="h-8 text-sm bg-white" />
                </div>
                <div className="col-span-5">
                  <Input placeholder="/path" className="h-8 text-sm font-mono bg-white" />
                </div>
                <div className="col-span-3 flex justify-end">
                  <Button variant="secondary" className="h-8 text-xs px-3 bg-white">
                    <Plus size={14} className="mr-1" />
                    Add Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
