import React, { useRef, useState } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface Props {
  onSuccess?: () => void;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-');

const NewsArticleForm: React.FC<Props> = ({ onSuccess }) => {
  const { user } = useSupabaseAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { supabase } = await import('../../lib/supabase');

      // nombre único y carpeta opcional
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      // si quieres carpeta: `articles/${fileName}`
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(fileName, file);

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from('news-images')
        .getPublicUrl(fileName);

      setImageUrl(data.publicUrl);
    } catch (err: any) {
      setError(err?.message ?? 'Image upload failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const { supabase } = await import('../../lib/supabase');
      const content = editorRef.current?.innerHTML || '';

      const { error: insertError } = await supabase
        .from('news_articles')
        .insert({
          author_id: user.id,
          title,
          excerpt,
          content,
          image_url: imageUrl || null,
          category,
          slug: slugify(title),
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          is_published: isPublished,
          published_at: isPublished ? new Date().toISOString() : null,
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        // reset form
        setTitle('');
        setExcerpt('');
        if (editorRef.current) editorRef.current.innerHTML = '';
        setImageUrl('');
        setCategory('');
        setTags('');
        setIsPublished(false);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message ?? 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>

        {/* Toolbar básica */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            type="button"
            onClick={() => document.execCommand('bold')}
            className="px-2 py-1 border rounded text-sm"
            aria-label="Bold"
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => document.execCommand('italic')}
            className="px-2 py-1 border rounded text-sm italic"
            aria-label="Italic"
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => document.execCommand('insertUnorderedList')}
            className="px-2 py-1 border rounded text-sm"
            aria-label="Bulleted list"
            title="Bulleted list"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => document.execCommand('formatBlock', false, 'p')}
            className="px-2 py-1 border rounded text-sm"
            aria-label="Paragraph"
            title="Paragraph"
          >
            ¶
          </button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          className="w-full px-4 py-3 border rounded-lg min-h-[150px] focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors border-gray-200"
          contentEditable
          suppressContentEditableWarning
        />
      </div>

      {/* Imagen al bucket */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
        />
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="mt-2 h-40 object-cover rounded" />
        )}
      </div>

      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />

      <Input
        label="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        helperText="e.g. shopping, dining"
      />

      <div className="flex items-center space-x-2">
        <input
          id="isPublished"
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="h-4 w-4 text-brand-primary border-gray-300 rounded"
        />
        <label htmlFor="isPublished" className="text-sm text-gray-700">
          Published
        </label>
      </div>

      <Button type="submit" loading={loading} fullWidth>
        Create Article
      </Button>
    </form>
  );
};

export default NewsArticleForm;
