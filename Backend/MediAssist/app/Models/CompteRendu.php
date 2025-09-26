<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompteRendu extends Model
{
    use HasFactory;

    protected $table = 'compte_rendus';
    protected $primaryKey = 'ID_CR';

    protected $fillable = [
        'type',
        'description'
    ];

    public function appointment()
    {
        return $this->belongsTo(Appointment::class, 'ID_RV');
    }
}
