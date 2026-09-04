import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Seed admin UI button strings to UIDictionary
export async function POST() {
  try {
    const adminButtons = [
      {
        key: 'admin.buttons.update',
        en: 'Update',
        ru: 'Обновить',
        tj: 'Навсозӣ',
        category: 'admin_buttons',
        description: 'Update button in admin panel',
      },
      {
        key: 'admin.buttons.create',
        en: 'Create',
        ru: 'Создать',
        tj: 'Эҷод кардан',
        category: 'admin_buttons',
        description: 'Create button in admin panel',
      },
      {
        key: 'admin.buttons.cancel',
        en: 'Cancel',
        ru: 'Отмена',
        tj: 'Бекор кардан',
        category: 'admin_buttons',
        description: 'Cancel button in admin panel',
      },
      {
        key: 'admin.buttons.delete',
        en: 'Delete',
        ru: 'Удалить',
        tj: 'Хазв кардан',
        category: 'admin_buttons',
        description: 'Delete button in admin panel',
      },
      {
        key: 'admin.buttons.search',
        en: 'Search',
        ru: 'Поиск',
        tj: 'Ҷустуҷӯ',
        category: 'admin_buttons',
        description: 'Search button in admin panel',
      },
      {
        key: 'admin.buttons.filter',
        en: 'Filter',
        ru: 'Фильтр',
        tj: 'Филтр',
        category: 'admin_buttons',
        description: 'Filter button in admin panel',
      },
      {
        key: 'admin.buttons.edit',
        en: 'Edit',
        ru: 'Редактировать',
        tj: 'Таҳрир кардан',
        category: 'admin_buttons',
        description: 'Edit button in admin panel',
      },
      {
        key: 'admin.buttons.save',
        en: 'Save',
        ru: 'Сохранить',
        tj: 'Захира кардан',
        category: 'admin_buttons',
        description: 'Save button in admin panel',
      },
      {
        key: 'admin.buttons.preview',
        en: 'Preview',
        ru: 'Предпросмотр',
        tj: 'Пешнамоиш',
        category: 'admin_buttons',
        description: 'Preview button in admin panel',
      },
    ];

    for (const button of adminButtons) {
      await prisma.uIDictionary.upsert({
        where: { key: button.key },
        update: {
          en: button.en,
          ru: button.ru,
          tj: button.tj,
          category: button.category,
          description: button.description,
        },
        create: button,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin button strings seeded successfully',
    });
  } catch (error) {
    console.error('Error seeding admin buttons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed admin buttons' },
      { status: 500 }
    );
  }
}

