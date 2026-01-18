<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessCard;
use App\Models\SocialLink;
use App\Models\Product;
use App\Models\IndustryTag;
use App\Models\ProductPhoto;
use App\Models\ProductLink;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class CardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = BusinessCard::query();

        // If user is not admin, only show their cards
        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by template
        if ($request->has('template')) {
            $query->where('template', $request->template);
        }

        // Filter by public status
        if ($request->has('is_public')) {
            $query->where('is_public', $request->boolean('is_public'));
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $cards = $query->with(['user', 'socialLinks', 'products.photos', 'products.links', 'industryTags'])
                      ->paginate($perPage);

        return response()->json(['cards' => $cards]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Check subscription plan limitations
        $existingCardsCount = BusinessCard::where('user_id', $user->id)->count();
        
        $maxCards = 1; // Default for free plan
        if ($user->subscription_plan === 'professional') {
            $maxCards = 3;
        } elseif ($user->subscription_plan === 'enterprise') {
            $maxCards = 999; // Essentially unlimited
        }

        if ($existingCardsCount >= $maxCards) {
            return response()->json([
                'error' => 'Card limit reached',
                // 'message' => "您的{$user->subscription_plan === 'free' ? '免费' : '专业'}套餐最多只能创建{$maxCards}张名片。请升级套餐以创建更多名片。",
                'message' => '您的' 
                    . ($user->subscription_plan === 'free' ? '免费' : '专业')
                    . "套餐最多只能创建{$maxCards}张名片。请升级套餐以创建更多名片。",
                'currentCards' => $existingCardsCount,
                'maxCards' => $maxCards,
                'subscriptionPlan' => $user->subscription_plan
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'office_phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:255',
            'cover_photo' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'template' => 'nullable|string|max:50',
            'is_public' => 'boolean',
            'social_links' => 'nullable|array',
            'social_links.*.platform' => 'required|string|max:50',
            'social_links.*.url' => 'required|url|max:255',
            'social_links.*.username' => 'nullable|string|max:255',
            'products' => 'nullable|array',
            'products.*.name' => 'required|string|max:255',
            'products.*.description' => 'nullable|string|max:1000',
            'products.*.image' => 'nullable|string|max:255',
            'industry_tags' => 'nullable|array',
            'industry_tags.*' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $card = DB::transaction(function () use ($request) {
                $cardData = $request->only([
                    'name', 'company', 'position', 'phone', 'office_phone',
                    'email', 'address', 'website', 'bio', 'avatar', 'cover_photo', 'logo',
                    'location', 'template', 'is_public'
                ]);

                $cardData['user_id'] = $request->user()->id;
                $cardData['template'] = $cardData['template'] ?? 'modern-blue';
                $cardData['is_public'] = $cardData['is_public'] ?? true;

                $card = BusinessCard::create($cardData);

                // Handle social links
                if ($request->has('social_links')) {
                    foreach ($request->social_links as $linkData) {
                        $card->socialLinks()->create([
                            'platform' => $linkData['platform'],
                            'url' => $linkData['url'],
                            'username' => $linkData['username'] ?? null
                        ]);
                    }
                }

                // Handle products
                if ($request->has('products')) {
                    foreach ($request->products as $productData) {
                        $product = $card->products()->create([
                            'name' => $productData['name'],
                            'description' => $productData['description'] ?? null,
                            'image' => $productData['image'] ?? null
                        ]);

                        // Handle product photos
                        if (isset($productData['photos']) && is_array($productData['photos'])) {
                            foreach ($productData['photos'] as $photoUrl) {
                                $product->photos()->create(['url' => $photoUrl]);
                            }
                        }

                        // Handle product links
                        if (isset($productData['links']) && is_array($productData['links'])) {
                            foreach ($productData['links'] as $linkData) {
                                $product->links()->create([
                                    'title' => $linkData['title'],
                                    'url' => $linkData['url']
                                ]);
                            }
                        }
                    }
                }

                // Handle industry tags
                if ($request->has('industry_tags')) {
                    foreach ($request->industry_tags as $tag) {
                        $card->industryTags()->create(['tag' => $tag]);
                    }
                }

                return $card;
            });

            $card->load(['user', 'socialLinks', 'products.photos', 'products.links', 'industryTags']);

            return response()->json([
                'message' => 'Business card created successfully',
                'card' => $card
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $card = BusinessCard::with(['user', 'socialLinks', 'products.photos', 'products.links', 'industryTags'])
                           ->findOrFail($id);

        // Increment view count if card is public
        if ($card->is_public) {
            $card->increment('view_count');
        }

        // Check if user is authenticated and is the card owner
        $isOwner = false;
        if ($request->user()) {
            $isOwner = $request->user()->id === $card->user_id;
        }

        // Create a response object that excludes private analytics for non-owners
        $responseCard = [
            'id' => $card->id,
            'userId' => $card->user_id,
            'name' => $card->name,
            'company' => $card->company,
            'position' => $card->position,
            'phone' => $card->phone,
            'officePhone' => $card->office_phone,
            'email' => $card->email,
            'address' => $card->address,
            'website' => $card->website,
            'bio' => $card->bio,
            'avatar' => $card->avatar,
            'coverPhoto' => $card->cover_photo,
            'logo' => $card->logo,
            'location' => $card->location,
            'template' => $card->template,
            'isPublic' => $card->is_public,
            'createdAt' => $card->created_at,
            'updatedAt' => $card->updated_at,
            'user' => $card->user,
            'socialLinks' => $card->socialLinks,
            'products' => $card->products,
            'industryTags' => $card->industryTags,
            'viewCount' => $isOwner ? $card->view_count : null
        ];

        return response()->json(['card' => $responseCard]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $card = BusinessCard::findOrFail($id);

        // Authorization check
        if ($card->user_id !== $request->user()->id) {
            return response()->json([
                'error' => 'Card not found or unauthorized'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'office_phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'website' => 'nullable|url|max:255',
            'bio' => 'nullable|string|max:1000',
            'avatar' => 'nullable|string|max:255',
            'cover_photo' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'template' => 'nullable|string|max:50',
            'is_public' => 'boolean',
            'social_links' => 'nullable|array',
            'social_links.*.platform' => 'required|string|max:50',
            'social_links.*.url' => 'required|url|max:255',
            'social_links.*.username' => 'nullable|string|max:255',
            'products' => 'nullable|array',
            'products.*.name' => 'required|string|max:255',
            'products.*.description' => 'nullable|string|max:1000',
            'products.*.image' => 'nullable|string|max:255',
            'industry_tags' => 'nullable|array',
            'industry_tags.*' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $result = DB::transaction(function () use ($request, $card) {
                $cardData = $request->only([
                    'name', 'company', 'position', 'phone', 'office_phone',
                    'email', 'address', 'website', 'bio', 'avatar', 'cover_photo', 'logo',
                    'location', 'template', 'is_public'
                ]);

                $card->update($cardData);

                // Handle social links - delete all and recreate
                $card->socialLinks()->delete();
                if ($request->has('social_links') && count($request->social_links) > 0) {
                    foreach ($request->social_links as $linkData) {
                        $card->socialLinks()->create([
                            'platform' => $linkData['platform'],
                            'url' => $linkData['url'],
                            'username' => $linkData['username'] ?? null
                        ]);
                    }
                }

                // Handle products - delete all and recreate with transaction safety
                $card->products()->each(function ($product) {
                    $product->photos()->delete();
                    $product->links()->delete();
                });
                $card->products()->delete();

                if ($request->has('products') && count($request->products) > 0) {
                    foreach ($request->products as $productData) {
                        $product = $card->products()->create([
                            'name' => $productData['name'],
                            'description' => $productData['description'] ?? null,
                            'image' => $productData['image'] ?? null
                        ]);

                        // Add product photos
                        if (isset($productData['photos']) && is_array($productData['photos'])) {
                            foreach ($productData['photos'] as $photoUrl) {
                                $product->photos()->create(['url' => $photoUrl]);
                            }
                        }

                        // Add product links
                        if (isset($productData['links']) && is_array($productData['links'])) {
                            foreach ($productData['links'] as $linkData) {
                                $product->links()->create([
                                    'title' => $linkData['title'],
                                    'url' => $linkData['url']
                                ]);
                            }
                        }
                    }
                }

                // Handle industry tags
                $card->industryTags()->delete();
                if ($request->has('industry_tags') && count($request->industry_tags) > 0) {
                    foreach ($request->industry_tags as $tag) {
                        $card->industryTags()->create(['tag' => $tag]);
                    }
                }

                return $card->load(['user', 'socialLinks', 'products.photos', 'products.links', 'industryTags']);
            });

            return response()->json([
                'message' => 'Business card updated successfully',
                'card' => $result
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Internal server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $card = BusinessCard::findOrFail($id);

        // Authorization check
        if ($card->user_id !== $request->user()->id) {
            return response()->json([
                'error' => 'Card not found or unauthorized'
            ], 404);
        }

        $card->delete();

        return response()->json([
            'message' => 'Business card deleted successfully'
        ]);
    }

    /**
     * Get public cards for marketplace.
     */
    public function publicCards(Request $request)
    {
        $query = BusinessCard::where('is_public', true);

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Filter by industry
        if ($request->has('industry')) {
            $query->whereHas('industryTags', function ($q) use ($request) {
                $q->where('tag', $request->industry);
            });
        }

        // Filter by location
        if ($request->has('location')) {
            $query->where('location', 'like', "%{$request->location}%");
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'view_count');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $cards = $query->with(['user', 'socialLinks', 'products.photos', 'products.links', 'industryTags'])
                      ->paginate($perPage);

        return response()->json($cards);
    }
}