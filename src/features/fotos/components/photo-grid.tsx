"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import {
  staggerContainer,
  fadeInUp,
} from "@/animations/variants";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoUploadModal } from "./photo-upload-modal";
import { usePhotos } from "../hooks/use-photos";

export function PhotoGrid() {
  const {
    photos,
    isLoading,
    uploadPhoto,
    isUploading,
    deletePhoto,
  } = usePhotos();

  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">
          Fotos
        </h2>

        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar foto
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="aspect-square w-full"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Vamos começar?"
          description="Adicione fotos de casos, procedimentos e disciplinas."
          actionLabel="Adicionar foto"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              variants={fadeInUp}
              className="group relative aspect-square overflow-hidden rounded-[var(--radius-card)] border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.description ?? "Foto"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="truncate text-xs text-white">
                  {photo.description}
                </p>

                {photo.phase && (
                  <Badge
                    className="mt-1"
                    variant="primary"
                  >
                    {photo.phase}
                  </Badge>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  deletePhoto({
                    id: photo.id,
                    storagePath: photo.storagePath,
                  })
                }
                className="absolute right-2 top-2 hidden rounded-full bg-black/60 p-1.5 text-white group-hover:block hover:bg-error"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      <PhotoUploadModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        submitting={isUploading}
        onSubmit={async (file, meta) => {
          await uploadPhoto({
            file,
            meta,
          });
        }}
      />
    </div>
  );
}
