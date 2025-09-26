<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class Analysis extends Model
{
    use HasFactory;

    protected $primaryKey = 'ID_Analyse';
    protected $table = 'analyses';

    protected $fillable = ['type_analyse', 'departement','archived'];

    public function appointments()
    {
        return $this->belongsToMany(Appointment::class, 'appointment_analysis');
    }
}
?>
